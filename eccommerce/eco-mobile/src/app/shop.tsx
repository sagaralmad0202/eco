import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/screen-header';
import { Reveal as FadeIn } from '@/components/ui/motion';
import { useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

const PRODUCTS = [
  { id: '1', name: 'Basic Tee', subtitle: 'Sienna Brown', price: '$199', image: require('@/assets/images/p1.webp'), rating: '4.5', tag: 'New', colors: ['#7B4214', '#111'] },
  { id: '2', name: 'Basic Coahuila', subtitle: 'Black Night', price: '$99', image: require('@/assets/images/p2.webp'), rating: '4.2', colors: ['#111', '#6B4226'] },
  { id: '3', name: 'Nomad Tumbler', subtitle: 'Pure White', price: '$119', image: require('@/assets/images/p3.webp'), rating: '4.6', tag: 'New', colors: ['#fff', '#C0C0C0'] },
  { id: '4', name: 'Minimalist Watch', subtitle: 'Gold Silver', price: '$149', image: require('@/assets/images/p4.webp'), rating: '4.8', colors: ['#C5A028', '#111'] },
  { id: '5', name: 'Linen Blazer', subtitle: 'Wheat', price: '$95', image: require('@/assets/images/p5.webp'), rating: '4.3', tag: 'New', colors: ['#F5DEB3', '#808080'] },
  { id: '6', name: 'Velvet Skirt', subtitle: 'Wine Red', price: '$55', image: require('@/assets/images/p6.webp'), rating: '4.4', colors: ['#722F37', '#191970'] },
];

const FILTERS = ['All', 'Women', 'Men', 'Accessories', 'Footwear'];

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

export default function ShopScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';

  const toggleLike = (id: string) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={theme.backgroundElement} />

      <ScreenHeader
        title={'Shop'}
        accessory={
        <TouchableOpacity style={styles.cartBtn} activeOpacity={0.7}>
          <View style={[styles.bagIcon, { borderColor: theme.text }]}>
            <View style={[styles.bagHandle, { borderColor: theme.text }]} />
          </View>
          <View style={[styles.cartBadge, { backgroundColor: theme.text, borderColor: theme.backgroundElement }]}>
            <Text style={[styles.cartBadgeText, { color: theme.backgroundElement }]}>3</Text>
          </View>
        </TouchableOpacity>
        }
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isLight ? '#FAF9F6' : '#1C1B19', borderColor: isLight ? '#EAE8E3' : '#2D2D30', borderWidth: 1 }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search products…"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              activeFilter === f ? { backgroundColor: theme.text, borderColor: theme.text } : { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }
            ]}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterChipText, activeFilter === f ? { color: theme.backgroundElement } : { color: theme.textSecondary }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results header */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>142 results</Text>
        <TouchableOpacity style={styles.sortBtn}>
          <Text style={[styles.sortBtnText, { color: theme.text }]}>Sort by ↕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.prodGrid}>
          {PRODUCTS.map((item, index) => (
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
  cartBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bagIcon: { width: 18, height: 18, borderWidth: 2, borderColor: '#111827', borderRadius: 3, marginTop: 4 },
  bagHandle: { position: 'absolute', top: -5, left: 3, right: 3, height: 5, borderWidth: 2, borderColor: '#111827', borderBottomWidth: 0, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  cartBadge: { position: 'absolute', top: 2, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#fff' },
  cartBadgeText: { color: '#fff', fontSize: 8, fontWeight: '800' },

  searchContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f7', borderRadius: 14, paddingHorizontal: 14, height: 44 },
  searchIcon: { fontSize: 14, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },

  filterRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e5e7eb' },
  filterChipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#4b5563' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },

  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 6 },
  resultsCount: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortBtnText: { fontSize: 13, fontWeight: '600', color: '#111827' },

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
    marginBottom: 0,
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
