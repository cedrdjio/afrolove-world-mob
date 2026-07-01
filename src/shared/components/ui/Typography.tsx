import { Text, type TextProps } from 'react-native';
import { cn } from '@/shared/utils/cn';

/**
 * Typography primitives matching the design system:
 * - Display  → Barlow Condensed, uppercase headings ("Bon retour", "Vos passions")
 * - Heading  → Barlow, semibold labels/buttons/uppercase micro-copy
 * - Body     → Montserrat, paragraph copy
 */

export function DisplayText({ className, ...props }: TextProps) {
  return <Text className={cn('font-display text-ink', className)} {...props} />;
}

export function DisplayBlackText({ className, ...props }: TextProps) {
  return <Text className={cn('font-display-black text-ink', className)} {...props} />;
}

export function HeadingText({ className, ...props }: TextProps) {
  return <Text className={cn('font-heading text-ink', className)} {...props} />;
}

export function LabelText({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn('font-heading-semibold uppercase tracking-wider text-ink-faint', className)}
      {...props}
    />
  );
}

export function BodyText({ className, ...props }: TextProps) {
  return <Text className={cn('font-body text-ink-muted', className)} {...props} />;
}

export function BodyMediumText({ className, ...props }: TextProps) {
  return <Text className={cn('font-body-medium text-ink-muted', className)} {...props} />;
}
