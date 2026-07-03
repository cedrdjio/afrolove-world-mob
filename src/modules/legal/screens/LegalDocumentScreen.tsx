import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { X, Check } from 'lucide-react-native';
import { ScreenBackground, GlowOrb } from '@/shared/components/layout';
import { GlassSurface } from '@/shared/components/ui/GlassSurface';
import { GradientButton } from '@/shared/components/ui/GradientButton';
import { ErrorState } from '@/shared/components/feedback/ErrorState';
import { useAppError } from '@/shared/hooks/useAppError';
import { legalService, type LegalDocumentKey } from '@/modules/legal/services/legalService';
import { useLegalConsentStore } from '@/modules/legal/stores/legalConsentStore';
import { colors } from '@/shared/constants/theme';

/** Renders the stored markdown-lite content: `#` title, `##` section,
 *  `_.._` note, `-` bullet, blank-separated paragraphs. Deliberately tiny —
 *  no markdown dependency in the bundle for two legal pages. */
function renderContent(content: string) {
  return content.split('\n').map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <View key={index} className="h-2" />;
    if (trimmed.startsWith('# ')) {
      return null; // the title is already in the header
    }
    if (trimmed.startsWith('## ')) {
      return (
        <Text key={index} className="mb-1.5 mt-4 font-heading text-[13.5px] uppercase tracking-wide text-ink">
          {trimmed.slice(3)}
        </Text>
      );
    }
    if (trimmed.startsWith('_') && trimmed.endsWith('_')) {
      return (
        <Text key={index} className="mb-2 font-body italic text-[12px] leading-[18px] text-brand">
          {trimmed.slice(1, -1)}
        </Text>
      );
    }
    if (trimmed.startsWith('- ')) {
      return (
        <View key={index} className="mb-1 flex-row items-start gap-2 pl-1">
          <View className="mt-[7px] h-1.5 w-1.5 rounded-full bg-brand" />
          <Text className="flex-1 font-body text-[12.5px] leading-[19px] text-ink-muted">{trimmed.slice(2)}</Text>
        </View>
      );
    }
    return (
      <Text key={index} className="mb-1 font-body text-[12.5px] leading-[19px] text-ink-muted">
        {trimmed}
      </Text>
    );
  });
}

export function LegalDocumentScreen() {
  const router = useRouter();
  const { key } = useLocalSearchParams<{ key: string }>();
  const documentKey: LegalDocumentKey = key === 'privacy' ? 'privacy' : 'terms';
  const setAcceptedFromModal = useLegalConsentStore((s) => s.setAcceptedFromModal);

  const documentQuery = useQuery({
    queryKey: ['legal-document', documentKey],
    queryFn: () => legalService.fetchDocument(documentKey),
    staleTime: 10 * 60 * 1000,
  });
  const documentError = useAppError(documentQuery.error);

  const handleAccept = () => {
    setAcceptedFromModal(true);
    router.back();
  };

  return (
    <View className="flex-1">
      <ScreenBackground theme="cream">
        <GlowOrb size={220} color="rgba(155,126,222,0.09)" top={-60} right={-60} duration={10000} />
      </ScreenBackground>

      <View className="flex-1 px-6" style={{ paddingTop: 26, paddingBottom: 30 }}>
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="flex-1 pr-3 font-display text-[21px] uppercase leading-tight text-ink">
            {documentQuery.data?.title ?? 'Document'}
          </Text>
          <Pressable onPress={() => router.back()}>
            <GlassSurface variant="light" radius={15} style={{ width: 40, height: 40 }}>
              <View className="h-10 w-10 items-center justify-center">
                <X size={17} color={colors.ink.DEFAULT} />
              </View>
            </GlassSurface>
          </Pressable>
        </View>

        {documentQuery.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
          </View>
        ) : documentError ? (
          <View className="flex-1 justify-center">
            <ErrorState error={documentError} variant="inline" onRetry={() => documentQuery.refetch()} />
          </View>
        ) : (
          <Animated.View entering={FadeInDown.duration(350).springify().damping(17)} className="flex-1">
            <ScrollView
              className="mb-4 flex-1 rounded-2xl border-[1.5px] border-white/90 bg-white/70"
              contentContainerClassName="px-5 py-4"
              showsVerticalScrollIndicator
            >
              {documentQuery.data ? renderContent(documentQuery.data.content) : null}
              <Text className="mt-4 font-body text-[10.5px] text-ink/30">
                Version {documentQuery.data?.version} · Mise à jour le{' '}
                {documentQuery.data ? new Date(documentQuery.data.updatedAt).toLocaleDateString('fr-FR') : ''}
              </Text>
            </ScrollView>

            <GradientButton
              label="J'ai lu et j'accepte"
              icon={<Check size={15} color="#fff" />}
              iconPosition="left"
              onPress={handleAccept}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}
