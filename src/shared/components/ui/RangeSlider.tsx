import { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/shared/constants/theme';

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 5;

function valueToRatio(value: number, min: number, max: number): number {
  'worklet';
  if (max <= min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}

function Thumb() {
  return (
    <View
      style={{
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: '#fff',
        borderWidth: 2.5,
        borderColor: colors.brand.DEFAULT,
        shadowColor: colors.brand.DEFAULT,
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      }}
    />
  );
}

interface SliderBaseProps {
  min: number;
  max: number;
  step?: number;
}

interface SliderProps extends SliderBaseProps {
  value: number;
  /** Appelé pendant le glissement (valeur arrondie au step). */
  onChange: (value: number) => void;
}

/** Curseur simple façon maquette Filtres (distance). */
export function Slider({ min, max, step = 1, value, onChange }: SliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const position = useSharedValue(0);
  const startPosition = useSharedValue(0);

  useEffect(() => {
    if (trackWidth > 0) position.value = valueToRatio(value, min, max) * trackWidth;
    // La position ne doit se re-synchroniser que sur les changements externes
    // (reset), pas à chaque frame du geste — d'où la dépendance sur value.
  }, [value, trackWidth, min, max, position]);

  const emit = (ratio: number) => {
    const raw = min + ratio * (max - min);
    const stepped = Math.round(raw / step) * step;
    if (stepped !== value) onChange(Math.min(max, Math.max(min, stepped)));
  };

  const pan = Gesture.Pan()
    .onBegin(() => {
      startPosition.value = position.value;
    })
    .onUpdate((event) => {
      const next = Math.min(trackWidth, Math.max(0, startPosition.value + event.translationX));
      position.value = next;
      if (trackWidth > 0) runOnJS(emit)(next / trackWidth);
    })
    .onFinalize(() => {
      runOnJS(triggerSelectionHaptic)();
    });

  const fillStyle = useAnimatedStyle(() => ({ width: position.value }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value - THUMB_SIZE / 2 }],
  }));

  return (
    <View style={{ height: 34, justifyContent: 'center' }} onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}>
      <View style={{ height: TRACK_HEIGHT, borderRadius: 3, backgroundColor: 'rgba(46,36,64,0.1)' }} />
      <Animated.View
        style={[
          {
            position: 'absolute',
            height: TRACK_HEIGHT,
            borderRadius: 3,
            backgroundColor: colors.brand.DEFAULT,
          },
          fillStyle,
        ]}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={[{ position: 'absolute', padding: 8, margin: -8 }, thumbStyle]} hitSlop={12}>
          <Thumb />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

interface DualSliderProps extends SliderBaseProps {
  lowValue: number;
  highValue: number;
  /** Appelé pendant le glissement avec la borne déplacée. */
  onChange: (low: number, high: number) => void;
}

function triggerSelectionHaptic() {
  Haptics.selectionAsync().catch(() => {});
}

/** Curseur double façon maquette Filtres (tranche d'âge). */
export function DualSlider({ min, max, step = 1, lowValue, highValue, onChange }: DualSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const lowPosition = useSharedValue(0);
  const highPosition = useSharedValue(0);
  const startLow = useSharedValue(0);
  const startHigh = useSharedValue(0);

  useEffect(() => {
    if (trackWidth > 0) {
      lowPosition.value = valueToRatio(lowValue, min, max) * trackWidth;
      highPosition.value = valueToRatio(highValue, min, max) * trackWidth;
    }
  }, [lowValue, highValue, trackWidth, min, max, lowPosition, highPosition]);

  const toValue = (ratio: number) => {
    const raw = min + ratio * (max - min);
    return Math.min(max, Math.max(min, Math.round(raw / step) * step));
  };

  const emitLow = (ratio: number) => {
    const next = Math.min(toValue(ratio), highValue - step);
    if (next !== lowValue) onChange(next, highValue);
  };
  const emitHigh = (ratio: number) => {
    const next = Math.max(toValue(ratio), lowValue + step);
    if (next !== highValue) onChange(lowValue, next);
  };

  const lowPan = Gesture.Pan()
    .onBegin(() => {
      startLow.value = lowPosition.value;
    })
    .onUpdate((event) => {
      const next = Math.min(highPosition.value - THUMB_SIZE / 2, Math.max(0, startLow.value + event.translationX));
      lowPosition.value = next;
      if (trackWidth > 0) runOnJS(emitLow)(next / trackWidth);
    })
    .onFinalize(() => {
      runOnJS(triggerSelectionHaptic)();
    });

  const highPan = Gesture.Pan()
    .onBegin(() => {
      startHigh.value = highPosition.value;
    })
    .onUpdate((event) => {
      const next = Math.max(lowPosition.value + THUMB_SIZE / 2, Math.min(trackWidth, startHigh.value + event.translationX));
      highPosition.value = next;
      if (trackWidth > 0) runOnJS(emitHigh)(next / trackWidth);
    })
    .onFinalize(() => {
      runOnJS(triggerSelectionHaptic)();
    });

  const fillStyle = useAnimatedStyle(() => ({
    left: lowPosition.value,
    width: Math.max(0, highPosition.value - lowPosition.value),
  }));
  const lowThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: lowPosition.value - THUMB_SIZE / 2 }],
  }));
  const highThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: highPosition.value - THUMB_SIZE / 2 }],
  }));

  return (
    <View style={{ height: 34, justifyContent: 'center' }} onLayout={(e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width)}>
      <View style={{ height: TRACK_HEIGHT, borderRadius: 3, backgroundColor: 'rgba(46,36,64,0.1)' }} />
      <Animated.View
        style={[
          {
            position: 'absolute',
            height: TRACK_HEIGHT,
            borderRadius: 3,
            backgroundColor: colors.brand.DEFAULT,
          },
          fillStyle,
        ]}
      />
      <GestureDetector gesture={lowPan}>
        <Animated.View style={[{ position: 'absolute', padding: 8, margin: -8 }, lowThumbStyle]} hitSlop={12}>
          <Thumb />
        </Animated.View>
      </GestureDetector>
      <GestureDetector gesture={highPan}>
        <Animated.View style={[{ position: 'absolute', padding: 8, margin: -8 }, highThumbStyle]} hitSlop={12}>
          <Thumb />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
