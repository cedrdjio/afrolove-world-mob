import * as LucideIcons from 'lucide-react-native';
import { Circle, type LucideIcon } from 'lucide-react-native';

/** Resolves an icon name stored in the database (e.g. the `interests.icon`
 *  column, editable from a future admin dashboard) to its Lucide
 *  component, falling back to a neutral placeholder if the name is
 *  missing or no longer exists in the icon set. */
export function resolveIcon(name: string | null | undefined): LucideIcon {
  if (!name) return Circle;
  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[name];
  return icon ?? Circle;
}
