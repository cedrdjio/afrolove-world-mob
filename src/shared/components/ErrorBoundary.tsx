import { Component, type ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors } from '@/shared/constants/theme';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Last line of defense against unexpected render-time crashes (a bad hook,
 * a misconfigured third-party provider, etc.) — without this, React
 * unmounts the entire app on any uncaught error and the user sees a blank
 * or native red-box screen with no way back in. This has no dependency on
 * navigation or any other provider, since the crash it's catching could
 * come from anywhere above it in the tree.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    if (__DEV__) {
      console.error('[ErrorBoundary] Uncaught render error:', error, info.componentStack);
    }
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 items-center justify-center bg-cream px-8">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-danger/10">
            <AlertTriangle size={36} color={colors.danger} strokeWidth={1.6} />
          </View>
          <Text className="mb-2.5 text-center font-display text-[26px] leading-none text-ink">
            Une erreur est survenue
          </Text>
          <Text className="mb-8 text-center font-body text-[13px] leading-[20px] text-ink-muted">
            Quelque chose a mal tourné. Vous pouvez réessayer sans perdre votre session.
          </Text>
          <Pressable onPress={this.handleRetry} className="w-full rounded-[18px] bg-brand py-[17px]">
            <Text className="text-center font-heading text-[14px] tracking-wide text-white">
              Réessayer
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
