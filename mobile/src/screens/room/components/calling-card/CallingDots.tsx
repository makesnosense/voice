import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export default function CallingDots() {
  const opacities = useRef([
    new Animated.Value(0.2),
    new Animated.Value(0.2),
    new Animated.Value(0.2),
  ]).current;

  useEffect(() => {
    const animations = opacities.map((opacity, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.2,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(600 - index * 200),
        ]),
      ),
    );
    animations.forEach(animation => animation.start());
    return () => animations.forEach(animation => animation.stop());
  }, [opacities]);

  return (
    <View style={styles.row}>
      {opacities.map((opacity, index) => (
        <Animated.View key={index} style={[styles.dot, { opacity }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    height: 20,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94a3b8',
  },
});
