import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';
import { FlashList } from '@shopify/flash-list';

// expo-linear-gradient isn't a core RN component, so NativeWind won't
// resolve `className` on it unless we register the interop explicitly.
cssInterop(LinearGradient, { className: 'style' });

// Same for FlashList — map className/contentContainerClassName to their
// underlying style props so lists can keep using Tailwind utilities.
cssInterop(FlashList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});
