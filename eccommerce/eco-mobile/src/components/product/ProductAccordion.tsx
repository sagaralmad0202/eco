import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

interface ProductAccordionProps {
  category?: string;
}

export default function ProductAccordion({ category = 'General' }: ProductAccordionProps) {
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  const [openStates, setOpenStates] = useState<Record<string, boolean>>({
    'Shipping & Delivery': false,
    'Returns & Exchanges': false,
    'Care & Maintenance': false,
  });

  const toggle = (title: string) => {
    setOpenStates((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const isBags = category.toLowerCase().includes('bag');
  const isFragrance = category.toLowerCase().includes('fragrance');

  const careText = isBags
    ? 'Crafted with premium materials. Spot clean with a soft, slightly damp cloth. Condition periodically with a neutral leather balm and store in a protective dust cover away from direct sunlight.'
    : isFragrance
    ? 'Keep in a cool, dry place away from direct sunlight and heat sources. Keep the bottle tightly capped when not in use to preserve the top aromatic notes.'
    : 'Machine wash cold with like colors on a gentle cycle. Use mild detergent. Line dry or tumble dry low. Cool iron if needed. Do not bleach or dry clean.';

  const sections = [
    {
      title: 'Shipping & Delivery',
      icon: 'airplane-outline' as const,
      content: [
        '• Standard delivery: 3–5 business days (Free on orders over $50)',
        '• Express delivery: 1–2 business days available at checkout',
        '• Fully trackable shipping with realtime email and SMS notifications',
      ],
    },
    {
      title: 'Returns & Exchanges',
      icon: 'swap-horizontal-outline' as const,
      content: [
        '• 30-day complimentary return policy on all eligible items',
        '• Items must be unworn, undamaged, and with original tags attached',
        '• Instant prepaid return label generated directly through your account',
      ],
    },
    {
      title: 'Care & Maintenance',
      icon: 'sparkles-outline' as const,
      content: [careText],
    },
  ];

  return (
    <View style={styles.container}>
      {sections.map((item) => {
        const isOpen = !!openStates[item.title];
        return (
          <View
            key={item.title}
            style={[
              styles.itemWrap,
              {
                backgroundColor: isLight ? '#FFFFFF' : '#1C1C1E',
                borderColor: isLight ? '#EAE8E3' : '#2D2D30',
              },
            ]}
          >
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => toggle(item.title)}
              activeOpacity={0.75}
            >
              <View style={styles.headerLeft}>
                <Ionicons name={item.icon} size={18} color={theme.textSecondary} />
                <Text style={[styles.itemTitle, { color: theme.text }]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons
                name={isOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={theme.textSecondary}
              />
            </TouchableOpacity>

            {isOpen && (
              <View style={[styles.contentBox, { borderTopColor: isLight ? '#F0EFEA' : '#252528' }]}>
                {item.content.map((paragraph, idx) => (
                  <Text
                    key={idx}
                    style={[styles.contentText, { color: theme.textSecondary }]}
                  >
                    {paragraph}
                  </Text>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    gap: 8,
  },
  itemWrap: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  contentBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  contentText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
