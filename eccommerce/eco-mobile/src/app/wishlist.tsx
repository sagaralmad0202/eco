import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/screen-header';
import { Reveal as FadeIn } from '@/components/ui/motion';
import { useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

const WISHLIST_ITEMS = [
  { id: '1', name: 'Leather Tote', subtitle: 'Pink Yarrow', price: '$85', image: require('@/assets/images/p1.webp'), rating: '4.5', tag: 'New in', liked: true, colors: ['#000', '#7B4214'] },
  { id: '2', name: 'Silk Midi Dress', subtitle: 'Emerald', price: '$120', image: require('@/assets/images/p2.webp'), rating: '4.7', liked: false, colors: ['#3B9668', '#060A82'] },
  { id: '3', name: 'Denim Jacket', subtitle: 'Light Blue', price: '$65', image: require('@/assets/images/p3.webp'), rating: '4.3', tag: 'New in', liked: true, colors: ['#ADD8E6', '#00008B'] },
  { id: '4', name: 'Cashmere Sweater', subtitle: 'Cream', price: '$150', image: require('@/assets/images/p4.webp'), rating: '4.8', liked: false, colors: ['#FC9FAF', '#3B474E'] },
  { id: '5', name: 'Linen Blazer', subtitle: 'Wheat', price: '$95', image: require('@/assets/images/p5.webp'), rating: '4.3', liked: true, colors: ['#F5DEB3', '#808080'] },
  { id: '6', name: 'Velvet Skirt', subtitle: 'Wine Red', price: '$55', image: require('@/assets/images/p6.webp'), rating: '4.4', liked: true, colors: ['#722F37', '#191970'] },
];

function PressableCard({ children, style }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => Animated.spring(scale, { toValue: 0.985, friction: 10, tension: 180, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 8, tension: 160, useNativeDriver: true }).start()}
        style={{ flex: 1 }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function WishlistScreen() {
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>(
    WISHLIST_ITEMS.reduce((acc, item) => ({ ...acc, [item.id]: item.liked }), {})
  );
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';

  const toggleLike = (id: string) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const likedCount = Object.values(likedItems).filter(Boolean).length;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={theme.backgroundElement} />

      <ScreenHeader title={'Wishlist'} />

      {/* Profile mini header */}
      <View style={[styles.profileRow, { backgroundColor: theme.backgroundElement, borderBottomColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
        <View style={styles.profileAvatarWrap}>
          <Image source={require('@/assets/images/avatar1.webp')} style={styles.profileAvatar} />
        </View>
        <View>
          <Text style={[styles.profileName, { color: theme.text }]}>Enrico Cole</Text>
          <Text style={[styles.profileLoc, { color: theme.textSecondary }]}>Los Angeles, CA</Text>
        </View>
      </View>

      {/* Count + Sort */}
      <View style={styles.countRow}>
        <Text style={[styles.countText, { color: theme.text }]}>
          Saved Items <Text style={[styles.countNum, { color: theme.textSecondary }]}>({likedCount})</Text>
        </Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={[styles.sortText, { color: theme.textSecondary }]}>Sort ↓</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.prodGrid}>
          {WISHLIST_ITEMS.map((item, index) => (
            <FadeIn key={item.id} delay={index * 80}>
              <PressableCard style={[styles.prodCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                <View style={styles.prodImgWrap}>
                  <Image source={item.image} style={styles.prodImg} />
                  {item.tag && (
                    <View style={styles.prodBadge}>
                      <Text style={styles.prodBadgeText}>{item.tag}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.heartBtn, likedItems[item.id] && styles.heartBtnActive]}
                    onPress={() => toggleLike(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.heartText}>{likedItems[item.id] ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.prodBody}>
                  <View style={styles.colorSwatches}>
                    {item.colors.map((c, i) => (
                      <View key={i} style={[styles.colorDot, { backgroundColor: c }, c === '#fff' && { borderColor: 'rgba(0,0,0,0.15)' }]} />
                    ))}
                  </View>
                  <Text style={[styles.prodName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.prodSub, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                  <View style={styles.prodFooter}>
                    <View style={styles.priceTag}>
                      <Text style={styles.priceText}>{item.price}</Text>
                    </View>
                    <View style={styles.ratingPill}>
                      <Text style={styles.starIcon}>★</Text>
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
              </PressableCard>
            </FadeIn>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  profileAvatarWrap: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#f3f4f6' },
  profileAvatar: { width: '100%', height: '100%' },
  profileName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  profileLoc: { fontSize: 12, color: '#9ca3af', marginTop: 1 },

  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countText: { fontSize: 15, lineHeight: 20, fontWeight: '600', color: '#111827' },
  countNum: { fontWeight: '400', color: '#9ca3af' },
  sortText: { fontSize: 14, color: '#6b7280', fontWeight: '500' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  prodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prodCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f2',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },
  prodImgWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#f9fafb' },
  prodImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  prodBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#fff', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
  prodBadgeText: { fontSize: 9, fontWeight: '800', color: '#111827', textTransform: 'uppercase', letterSpacing: 0.5 },
  heartBtn: { position: 'absolute', top: 6, right: 6, width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
  heartBtnActive: { backgroundColor: '#fef2f2' },
  heartText: { fontSize: 14 },

  prodBody: { padding: 12 },
  colorSwatches: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  colorDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  prodName: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  prodSub: { fontSize: 11, color: '#9ca3af', marginBottom: 8 },
  prodFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceTag: { borderWidth: 1.5, borderColor: '#22c55e', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8, backgroundColor: '#f0fdf4' },
  priceText: { fontSize: 12, fontWeight: '800', color: '#16a34a' },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fffbeb', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 6 },
  starIcon: { color: '#facc15', fontSize: 12 },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#92400e' },
});
