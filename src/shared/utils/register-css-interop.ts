import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

// expo-linear-gradient isn't a core RN component, so NativeWind won't
// resolve `className` on it unless we register the interop explicitly.
cssInterop(LinearGradient, { className: 'style' });
