import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle, Info, AlertCircle } from 'lucide-react-native';
import { ScreenBackground } from '@/shared/components/layout';
import { IconButton } from '@/shared/components/ui/IconButton';
import { EmptyState } from '@/shared/components/feedback';
import { supabase } from '@/shared/services/supabase/client';
import { colors } from '@/shared/constants/theme';

type LevelFilter = 'all' | 'error' | 'warn' | 'info';

const LEVEL_STYLE: Record<string, { color: string; bg: string; Icon: typeof Info }> = {
  error: { color: colors.danger, bg: 'rgba(194,69,69,0.1)', Icon: AlertTriangle },
  warn: { color: colors.gold.DEFAULT, bg: 'rgba(212,175,55,0.12)', Icon: AlertCircle },
  info: { color: colors.brand.DEFAULT, bg: 'rgba(106,79,192,0.1)', Icon: Info },
};

const FILTERS: { key: LevelFilter; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'error', label: 'Erreurs' },
  { key: 'warn', label: 'Alertes' },
  { key: 'info', label: 'Infos' },
];

function formatWhen(iso: string): string {
  const date = new Date(iso);
  return `${date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Journal d'activité (admins uniquement — le RPC get_client_logs rejette les
 * autres comptes) : crashs, étapes de paiement et erreurs remontés par les
 * apps des membres, consultables directement depuis le téléphone sans passer
 * par le dashboard Supabase.
 */
export function ActivityLogScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<LevelFilter>('all');

  const logsQuery = useQuery({
    queryKey: ['client-logs', filter],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_client_logs', {
        p_limit: 150,
        p_level: filter === 'all' ? undefined : filter,
      });
      if (error) throw error;
      return data ?? [];
    },
  });

  const logs = logsQuery.data ?? [];

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream" />

      <View className="flex-row items-center gap-3 px-5" style={{ paddingTop: 60 }}>
        <IconButton onPress={() => router.back()}>
          <ArrowLeft size={19} color={colors.ink.DEFAULT} strokeWidth={2} />
        </IconButton>
        <Text className="font-display text-[24px] text-ink">Journal d'activité</Text>
      </View>

      <View className="flex-row gap-2 px-5 pt-4">
        {FILTERS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            className={`rounded-full border-[1.5px] px-3.5 py-1.5 ${
              filter === key ? 'border-brand bg-brand' : 'border-white/70 bg-white/[0.45]'
            }`}
          >
            <Text className={`font-heading text-[11px] ${filter === key ? 'text-white' : 'text-ink/50'}`}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {logsQuery.isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        </View>
      ) : logsQuery.isError ? (
        <EmptyState
          icon={<AlertTriangle size={30} color={colors.danger} strokeWidth={1.6} />}
          title="Accès refusé"
          description="Ce journal est réservé aux comptes administrateurs."
        />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Info size={30} color={colors.brand.DEFAULT} strokeWidth={1.6} />}
          title="Aucun événement"
          description="Les crashs, paiements et erreurs des apps apparaîtront ici."
        />
      ) : (
        <ScrollView
          className="mt-4"
          contentContainerClassName="px-5 pb-10"
          refreshControl={
            <RefreshControl
              refreshing={logsQuery.isRefetching}
              onRefresh={() => logsQuery.refetch()}
              tintColor={colors.brand.DEFAULT}
            />
          }
        >
          {logs.map((log) => {
            const style = LEVEL_STYLE[log.level] ?? LEVEL_STYLE.info;
            const Icon = style.Icon;
            return (
              <View
                key={log.id}
                className="mb-2 rounded-2xl border-[1.5px] border-white/70 bg-white/[0.45] px-4 py-3"
              >
                <View className="mb-1 flex-row items-center gap-2">
                  <View
                    className="h-6 w-6 items-center justify-center rounded-full"
                    style={{ backgroundColor: style.bg }}
                  >
                    <Icon size={12} color={style.color} strokeWidth={2.2} />
                  </View>
                  <Text className="flex-1 font-heading-semibold text-[12.5px] text-ink" numberOfLines={1}>
                    {log.event}
                  </Text>
                  <Text className="font-body text-[10px] text-ink/35">{formatWhen(log.created_at)}</Text>
                </View>
                {log.message ? (
                  <Text className="font-body text-[11.5px] leading-4 text-ink-muted" numberOfLines={4}>
                    {log.message}
                  </Text>
                ) : null}
                {log.context ? (
                  <Text className="mt-1 font-body text-[10px] leading-[14px] text-ink/30" numberOfLines={3}>
                    {JSON.stringify(log.context)}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
