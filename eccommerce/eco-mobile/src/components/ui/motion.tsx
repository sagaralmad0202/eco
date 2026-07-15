import { useMemo, type ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutLeft,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type RevealProps = {
  children: ReactNode;
  delay?: number;
  exitLeft?: boolean;
  style?: StyleProp<ViewStyle>;
};

const REVEAL_EXITING = FadeOutLeft
  .duration(180)
  .reduceMotion(ReduceMotion.System);

export function Reveal({
  children,
  delay = 0,
  exitLeft = false,
  style,
}: RevealProps) {
  const entering = useMemo(
    () => FadeInDown
      .delay(Math.min(delay, 160))
      .duration(240)
      .withInitialValues({ opacity: 0, translateY: 8 })
      .reduceMotion(ReduceMotion.System),
    [delay],
  );

  return (
    <Animated.View
      entering={entering}
      exiting={exitLeft ? REVEAL_EXITING : undefined}
      style={style}>
      {children}
    </Animated.View>
  );
}

type MotionPressableProps = Omit<PressableProps, 'style'> & {
  children: ReactNode;
  pressedScale?: number;
  style?: StyleProp<ViewStyle>;
};

export function MotionPressable({
  children,
  onPressIn,
  onPressOut,
  pressedScale = 0.985,
  style,
  ...props
}: MotionPressableProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      onPressIn={(event) => {
        scale.value = withSpring(pressedScale, {
          damping: 22,
          stiffness: 420,
          mass: 0.35,
          overshootClamping: true,
          reduceMotion: ReduceMotion.System,
        });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 360,
          mass: 0.4,
          overshootClamping: true,
          reduceMotion: ReduceMotion.System,
        });
        onPressOut?.(event);
      }}
      style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}
