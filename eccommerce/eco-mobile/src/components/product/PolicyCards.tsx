import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

const TRUST_PERKS = [
  {
    icon: 'cube-outline' as const,
    title: 'Free Shipping',
    desc: 'Complimentary delivery on orders over $50',
  },
  {
    icon: 'refresh-outline' as const,
    title: '30-Day Free Returns',
    desc: 'Hassle-free exchanges & returns guaranteed',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Authenticity Guarantee',
    desc: '100% verified genuine brand product',
  },
  {
    icon: 'lock-closed-outline' as const,
    title: 'Secure Checkout',
    desc: 'Encrypted end-to-end payment protection',
  },
];

export default function PolicyCards() {
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isLight ? '#FAF9F6' : '#1A1A1C',
          borderColor: isLight ? '#EAE8E3' : '#2D2D30',
        },
      ]}
    >
      <View style={styles.grid}>
        {TRUST_PERKS.map((item, index) => (
          <View key={index} style={styles.perkItem}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isLight ? '#FFFFFF' : '#252528',
                  borderColor: isLight ? '#EAE8E3' : '#333336',
                },
              ]}
            >
              <Ionicons name={item.icon} size={18} color={theme.text} />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              <Text style={[styles.desc, { color: theme.textSecondary }]}>
                {item.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginVertical: 18,
  },
  grid: {
    gap: 14,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
  },
});
