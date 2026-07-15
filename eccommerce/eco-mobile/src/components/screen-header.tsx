import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';

const HEADER_ENTERING = FadeIn.duration(220).reduceMotion(ReduceMotion.System);

type ScreenHeaderProps = {
  accessory?: ReactNode;
  title: string;
};

export function ScreenHeader({ accessory, title }: ScreenHeaderProps) {
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';

  return (
    <Animated.View
      entering={HEADER_ENTERING}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundElement,
          borderBottomColor: isLight ? '#E7E5E0' : '#323438',
        },
      ]}>
      <Text
        maxFontSizeMultiplier={1.35}
        numberOfLines={1}
        style={[styles.title, { color: theme.text }]}>
        {title}
      </Text>
      {accessory ? <View style={styles.accessory}>{accessory}</View> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  title: {
    flexShrink: 1,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  accessory: {
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
