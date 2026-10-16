import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '@/components/screen-header';
import { Reveal as FadeIn } from '@/components/ui/motion';
import { useTheme } from '@/hooks/use-theme';
import { productsApi, CardProduct, CategoryItem } from '@/services/products-api';

const { width } = Dimensions.get('window');

const LOCAL_ASSETS_MAP: Record<string, any> = {
  '1': require('@/assets/images/p1.webp'),
  '2': require('@/assets/images/p2.webp'),
  '3': require('@/assets/images/p3.webp'),
  '4': require('@/assets/images/p4.webp'),
  '5': require('@/assets/images/p5.webp'),
  '6': require('@/assets/images/p6.webp'),
  '7': require('@/assets/images/p7.webp'),
  '8': require('@/assets/images/p8.webp'),
  'leather-tote-bag': require('@/assets/images/p1.webp'),
  'silk-midi-dress': require('@/assets/images/p2.webp'),
  'denim-jacket': require('@/assets/images/p3.webp'),
  'cashmere-sweater': require('@/assets/images/p4.webp'),
  'linen-blazer': require('@/assets/images/p5.webp'),
  'velvet-skirt': require('@/assets/images/p6.webp'),
  'wool-trench-coat': require('@/assets/images/p7.webp'),
  'cotton-shirt': require('@/assets/images/p8.webp'),
  'sunrise-on-the-red-sand-dunes': require('@/assets/images/p7.webp'),
  'zara-lisboa-seoul': require('@/assets/images/p8.webp'),
  'quilted-chain-shoulder-bag': require('@/assets/images/p1.webp'),
  'designer-petite-mini-handbag': require('@/assets/images/p2.webp'),
  'active-utility-belt-bag': require('@/assets/images/p5.webp'),
  'drawstring-leather-bucket-bag': require('@/assets/images/p3.webp'),
};

const INITIAL_SHOP_PRODUCTS: CardProduct[] = [
  { id: '1', slug: 'leather-tote-bag', name: 'Leather Tote Bag', price: '$85.00', oldPrice: '$99.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1.webp', subtitle: 'Pink Yarrow', tag: 'New', colors: ['#000000', '#7B4214'], rating: '4.5', category: 'Bags', categorySlug: 'bags', inStock: true },
  { id: '2', slug: 'silk-midi-dress', name: 'Silk Midi Dress', price: '$120.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2.webp', subtitle: 'Emerald Green', tag: 'Hot 🔥', colors: ['#3B9668', '#060A82'], rating: '4.7', category: 'Women', categorySlug: 'women', inStock: true },
  { id: '3', slug: 'denim-jacket', name: 'Denim Jacket', price: '$65.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p3.webp', subtitle: 'Light Blue', tag: 'New', colors: ['#ADD8E6', '#000000'], rating: '4.3', category: 'Jackets', categorySlug: 'jackets', inStock: true },
  { id: '4', slug: 'cashmere-sweater', name: 'Cashmere Sweater', price: '$150.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p4.webp', subtitle: 'Cream', colors: ['#3B474E', '#FC9FAF'], rating: '4.8', category: 'Men', categorySlug: 'men', inStock: true },
  { id: '5', slug: 'linen-blazer', name: 'Linen Blazer', price: '$95.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p5.webp', subtitle: 'Beige', tag: 'New', colors: ['#F5DEB3', '#808080'], rating: '4.4', category: 'Men', categorySlug: 'men', inStock: true },
  { id: '6', slug: 'velvet-skirt', name: 'Velvet Skirt', price: '$55.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p6.webp', subtitle: 'Wine Red', tag: 'Hot 🔥', colors: ['#722F37', '#191970'], rating: '4.6', category: 'Women', categorySlug: 'women', inStock: true },
  { id: '7', slug: 'sunrise-on-the-red-sand-dunes', name: 'Sunrise On The Red Sand Dunes', price: '$180.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p7.webp', subtitle: 'Eau de Parfum', tag: 'New', colors: ['#D4AF37', '#A0522D'], rating: '4.9', category: 'Fragrance', categorySlug: 'fragrance', inStock: true },
  { id: '8', slug: 'zara-lisboa-seoul', name: 'Zara Lisboa & Seoul', price: '$45.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p8.webp', subtitle: 'Eau de Toilette', colors: ['#1E40AF', '#4B0082'], rating: '4.5', category: 'Fragrance', categorySlug: 'fragrance', inStock: true },
  { id: '9', slug: 'quilted-chain-shoulder-bag', name: 'Quilted Chain Shoulder Bag', price: '$175.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1.webp', subtitle: 'Black Quilted', tag: 'New', colors: ['#000000', '#D4AF37'], rating: '4.7', category: 'Bags', categorySlug: 'bags', inStock: true },
  { id: '10', slug: 'designer-petite-mini-handbag', name: 'Designer Petite Mini Handbag', price: '$110.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2.webp', subtitle: 'Rose Gold', tag: 'Hot 🔥', colors: ['#B76E79', '#FFFFFF'], rating: '4.6', category: 'Bags', categorySlug: 'bags', inStock: true },
  { id: '11', slug: 'active-utility-belt-bag', name: 'Active Utility Belt Bag', price: '$58.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p5.webp', subtitle: 'Forest Green', colors: ['#1B4D3E', '#000000'], rating: '4.4', category: 'Bags', categorySlug: 'bags', inStock: true },
  { id: '12', slug: 'drawstring-leather-bucket-bag', name: 'Drawstring Leather Bucket Bag', price: '$135.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p3.webp', subtitle: 'Tan Saddle', colors: ['#C19A6B', '#3E2723'], rating: '4.8', category: 'Bags', categorySlug: 'bags', inStock: true },
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All', slug: 'all', emoji: '✨' },
  { id: 'women', name: 'Women', slug: 'women', emoji: '👗' },
  { id: 'men', name: 'Men', slug: 'men', emoji: '👔' },
  { id: 'bags', name: 'Bags', slug: 'bags', emoji: '👜' },
  { id: 'jackets', name: 'Jackets', slug: 'jackets', emoji: '🧥' },
  { id: 'fragrance', name: 'Fragrance', slug: 'fragrance', emoji: '🌸' },
];

function ProductImage({ imageUrl, slug, style }: { imageUrl?: string; slug?: string; style?: any }) {
  const [loadError, setLoadError] = useState(false);
  const fallback = (slug && LOCAL_ASSETS_MAP[slug]) || LOCAL_ASSETS_MAP['leather-tote-bag'] || LOCAL_ASSETS_MAP['1'];

  if (!imageUrl || loadError) {
    return <Image source={fallback} style={style} resizeMode="cover" />;
  }
  return (
    <Image source={{ uri: imageUrl }} style={style} resizeMode="cover" onError={() => setLoadError(true)} />
  );
}

function PressableCard({ children, style, onPress }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
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
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<CardProduct[]>(INITIAL_SHOP_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';

  const toggleLike = (id: string) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.allSettled([
        productsApi.list({ limit: 30 }),
        productsApi.listCategories(),
      ]);

      if (prodRes.status === 'fulfilled' && prodRes.value.items.length > 0) {
        setProducts(prodRes.value.items);
      }
      if (catRes.status === 'fulfilled' && catRes.value.length > 0) {
        setCategories(catRes.value);
      }
    } catch (e) {
      console.warn('Failed to load shop products:', e);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadData().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const filterNames = useMemo(() => {
    const list = ['All'];
    categories.forEach(c => {
      const name = c.name === 'All Items' ? 'All' : c.name;
      if (name.toLowerCase() !== 'all' && !list.includes(name)) list.push(name);
    });
    return list.length > 1 ? list : ['All', 'Women', 'Men', 'Bags', 'Jackets', 'Fragrance'];
  }, [categories]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesFilter =
        activeFilter.toLowerCase() === 'all' ||
        p.category.toLowerCase() === activeFilter.toLowerCase() ||
        p.categorySlug.toLowerCase() === activeFilter.toLowerCase();

      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [products, activeFilter, searchQuery]);

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
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filterNames.map(f => {
            const isSelected = activeFilter.toLowerCase() === f.toLowerCase();
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  isSelected
                    ? { backgroundColor: theme.text, borderColor: theme.text }
                    : { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }
                ]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected ? { color: theme.backgroundElement, fontWeight: '700' } : { color: theme.textSecondary }
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results header */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
          {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
        </Text>
        <TouchableOpacity style={styles.sortBtn} activeOpacity={0.7}>
          <Text style={[styles.sortBtnText, { color: theme.text }]}>Sort by ↕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.text}
            colors={['#6366f1']}
          />
        }
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No products found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {searchQuery ? `No results matching "${searchQuery}"` : `No items found for "${activeFilter}"`}
            </Text>
            <TouchableOpacity
              style={[styles.resetBtn, { backgroundColor: theme.text }]}
              onPress={() => {
                setActiveFilter('All');
                setSearchQuery('');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.resetBtnText, { color: theme.backgroundElement }]}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.prodGrid}>
            {filteredProducts.map((item, index) => (
              <FadeIn key={item.id} delay={index * 50}>
                <PressableCard
                  onPress={() => router.push(`/product/${item.slug || item.id}` as any)}
                  style={[styles.prodCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}
                >
                  <View style={styles.prodImgWrap}>
                    <ProductImage imageUrl={item.image} slug={item.slug} style={styles.prodImg} />
                    {item.tag && (
                      <View style={[styles.prodBadge, (item.tag.includes('🔥') || item.tag.toLowerCase().includes('hot')) ? styles.prodBadgeHot : styles.prodBadgeNew]}>
                        <Text style={[styles.prodBadgeText, (item.tag.includes('🔥') || item.tag.toLowerCase().includes('hot')) && styles.prodBadgeHotText]}>
                          {item.tag}
                        </Text>
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
                    <Text style={[styles.prodName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.prodSub, { color: theme.textSecondary }]} numberOfLines={1}>{item.subtitle}</Text>
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
        )}
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

  filterWrapper: {
    height: 44,
    marginBottom: 4,
  },
  filterRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
  },

  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  resultsCount: { fontSize: 13, color: '#9ca3af', fontWeight: '500' },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortBtnText: { fontSize: 13, fontWeight: '600', color: '#111827' },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
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
  prodImgWrap: { width: '100%', aspectRatio: 1, backgroundColor: '#f9fafb', position: 'relative' },
  prodImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  prodBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 6,
    zIndex: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodBadgeNew: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  prodBadgeHot: {
    backgroundColor: '#FEF2F2',
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  prodBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#111111',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  prodBadgeHotText: {
    color: '#EF4444',
  },
  heartBtn: { position: 'absolute', top: 6, right: 6, width: 34, height: 34, borderRadius: 17, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
  heartBtnActive: { backgroundColor: '#fef2f2' },
  heartText: { fontSize: 13 },

  prodBody: { padding: 12 },
  colorSwatches: { flexDirection: 'row', gap: 4, marginBottom: 6 },
  colorDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  prodName: { fontSize: 14, fontWeight: '700', color: '#111111', marginBottom: 2 },
  prodSub: { fontSize: 11, color: '#9ca3af', marginBottom: 8 },
  prodFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceTag: { borderWidth: 1.5, borderColor: '#22c55e', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8, backgroundColor: '#f0fdf4' },
  priceText: { fontSize: 12, fontWeight: '800', color: '#16a34a' },
  ratingPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#fffbeb', paddingVertical: 3, paddingHorizontal: 6, borderRadius: 6 },
  starIcon: { color: '#facc15', fontSize: 12 },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#92400e' },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  resetBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 99,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
