import { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { TEXT_PRIMARY } from '../styles/colors';

// mirrors the web HeaderAnimation bar geometry
const BARS: { height: number; delay: number }[] = [
  { height: 12, delay: 0 },
  { height: 24, delay: 200 },
  { height: 18, delay: 400 },
  { height: 30, delay: 600 },
  { height: 9, delay: 800 },
];

const CYCLE_DURATION = 1500;

export default function WaveformBars() {
  const scales = useRef(BARS.map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    const animations = scales.map(scale =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1,
            duration: CYCLE_DURATION / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.3,
            duration: CYCLE_DURATION / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    const timers = BARS.map(({ delay }, i) =>
      setTimeout(() => animations[i].start(), delay),
    );

    return () => {
      timers.forEach(clearTimeout);
      animations.forEach(a => a.stop());
    };
  }, [scales]);

  return (
    <View style={styles.container}>
      {BARS.map(({ height }, i) => (
        <Animated.View
          key={i}
          style={[styles.bar, { height, transform: [{ scaleY: scales[i] }] }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    width: 42,
    height: 42,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: TEXT_PRIMARY,
  },
});
