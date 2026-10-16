import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

export default function ProductDetailsSkeleton() {
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const blockColor = isLight ? '#E5E7EB' : '#2A2A2E';

  return (
    <Animated.View style={[styles.container, { opacity: pulseAnim }]}>
      {/* Gallery Skeleton */}
      <View style={[styles.gallery, { backgroundColor: blockColor }]} />

      {/* Thumbnails row */}
      <View style={styles.thumbRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.thumb, { backgroundColor: blockColor }]} />
        ))}
      </View>

      {/* Title & category */}
      <View style={[styles.breadcrumb, { backgroundColor: blockColor }]} />
      <View style={[styles.title, { backgroundColor: blockColor }]} />

      {/* Price & rating */}
      <View style={styles.priceRow}>
        <View style={[styles.priceTag, { backgroundColor: blockColor }]} />
        <View style={[styles.rating, { backgroundColor: blockColor }]} />
      </View>

      {/* Color circles */}
      <View style={styles.swatchRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.swatch, { backgroundColor: blockColor }]} />
        ))}
      </View>

      {/* Sizes */}
      <View style={styles.sizeRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.sizeBox, { backgroundColor: blockColor }]} />
        ))}
      </View>

      {/* Action buttons */}
      <View style={[styles.btn, { backgroundColor: blockColor }]} />
      <View style={[styles.btn, { backgroundColor: blockColor, marginTop: 8 }]} />

      {/* Accordions */}
      <View style={styles.accordions}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.accordionItem, { backgroundColor: blockColor }]} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  gallery: {
    width: '100%',
    height: width * 1.1,
    borderRadius: 20,
    marginBottom: 12,
  },
  thumbRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  thumb: {
    width: 60,
    height: 70,
    borderRadius: 12,
  },
  breadcrumb: {
    width: 140,
    height: 14,
    borderRadius: 4,
    marginBottom: 10,
  },
  title: {
    width: '75%',
    height: 26,
    borderRadius: 6,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  priceTag: {
    width: 80,
    height: 36,
    borderRadius: 10,
  },
  rating: {
    width: 120,
    height: 20,
    borderRadius: 6,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  sizeBox: {
    width: 50,
    height: 42,
    borderRadius: 10,
  },
  btn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
  },
  accordions: {
    marginTop: 24,
    gap: 10,
  },
  accordionItem: {
    width: '100%',
    height: 48,
    borderRadius: 14,
  },
});
