import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Platform,
  Animated,
  Easing,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { productsApi, CardProduct, CategoryItem } from '@/services/products-api';
import {
  Button as AntButton,
  Tag as AntTag,
  Badge as AntBadge,
  Toast,
  ActivityIndicator as AntActivityIndicator,
} from '@ant-design/react-native';

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

const INITIAL_NEW_ARRIVALS: CardProduct[] = [
  { id: '1', slug: 'leather-tote-bag', name: 'Leather Tote Bag', price: '$85.00', oldPrice: '$99.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1.webp', subtitle: 'Pink Yarrow', tag: 'New', colors: ['#000000', '#7B4214'], rating: '4.5', category: 'Bags', categorySlug: 'bags', inStock: true },
  { id: '2', slug: 'silk-midi-dress', name: 'Silk Midi Dress', price: '$120.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2.webp', subtitle: 'Emerald Green', tag: 'Hot 🔥', colors: ['#3B9668', '#060A82'], rating: '4.7', category: 'Women', categorySlug: 'women', inStock: true },
  { id: '3', slug: 'denim-jacket', name: 'Denim Jacket', price: '$65.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p3.webp', subtitle: 'Light Blue', tag: 'New', colors: ['#ADD8E6', '#000000'], rating: '4.3', category: 'Jackets', categorySlug: 'jackets', inStock: true },
  { id: '4', slug: 'cashmere-sweater', name: 'Cashmere Sweater', price: '$150.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p4.webp', subtitle: 'Cream', colors: ['#3B474E', '#FC9FAF'], rating: '4.8', category: 'Men', categorySlug: 'men', inStock: true },
  { id: '5', slug: 'linen-blazer', name: 'Linen Blazer', price: '$95.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p5.webp', subtitle: 'Beige', tag: 'New', colors: ['#F5DEB3', '#808080'], rating: '4.4', category: 'Men', categorySlug: 'men', inStock: true },
  { id: '6', slug: 'velvet-skirt', name: 'Velvet Skirt', price: '$55.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p6.webp', subtitle: 'Wine Red', tag: 'Hot 🔥', colors: ['#722F37', '#191970'], rating: '4.6', category: 'Women', categorySlug: 'women', inStock: true },
];

const INITIAL_FAVORITES: CardProduct[] = [
  { id: '1', slug: 'leather-tote-bag', name: 'Leather Tote Bag', price: '$85.00', oldPrice: '$99.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1.webp', subtitle: 'Pink Yarrow', tag: 'New', colors: ['#000000', '#7B4214'], rating: '4.5', category: 'Bags', categorySlug: 'bags', inStock: true },
  { id: '2', slug: 'silk-midi-dress', name: 'Silk Midi Dress', price: '$120.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2.webp', subtitle: 'Emerald Green', tag: 'Hot 🔥', colors: ['#3B9668', '#060A82'], rating: '4.7', category: 'Women', categorySlug: 'women', inStock: true },
  { id: '4', slug: 'cashmere-sweater', name: 'Cashmere Sweater', price: '$150.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p4.webp', subtitle: 'Cream', colors: ['#3B474E', '#FC9FAF'], rating: '4.8', category: 'Men', categorySlug: 'men', inStock: true },
  { id: '6', slug: 'velvet-skirt', name: 'Velvet Skirt', price: '$55.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p6.webp', subtitle: 'Wine Red', tag: 'Hot 🔥', colors: ['#722F37', '#191970'], rating: '4.6', category: 'Women', categorySlug: 'women', inStock: true },
  { id: '7', slug: 'sunrise-on-the-red-sand-dunes', name: 'Sunrise On The Red Sand Dunes', price: '$180.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p7.webp', subtitle: 'Eau de Parfum', tag: 'New', colors: ['#D4AF37', '#A0522D'], rating: '4.9', category: 'Fragrance', categorySlug: 'fragrance', inStock: true },
  { id: '8', slug: 'zara-lisboa-seoul', name: 'Zara Lisboa & Seoul', price: '$45.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p8.webp', subtitle: 'Eau de Toilette', colors: ['#1E40AF', '#4B0082'], rating: '4.5', category: 'Fragrance', categorySlug: 'fragrance', inStock: true },
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'all', name: 'All Items', slug: 'all', emoji: '' },
  { id: 'women', name: 'Women', slug: 'women', emoji: '' },
  { id: 'men', name: 'Men', slug: 'men', emoji: '' },
  { id: 'bags', name: 'Bags', slug: 'bags', emoji: '' },
  { id: 'jackets', name: 'Jackets', slug: 'jackets', emoji: '' },
  { id: 'fragrance', name: 'Fragrance', slug: 'fragrance', emoji: '' },
  { id: 'beauty', name: 'Beauty', slug: 'beauty', emoji: '' },
];

const SPECIAL_OFFER_POINTS = [
  { id: '01', label: 'Savings combos', color: '#A35DE2', bg: '#F1E2FF' },
  { id: '02', label: 'Freeship', color: '#2FA96B', bg: '#DDF5E7' },
  { id: '03', label: 'Premium magazines', color: '#E26B76', bg: '#FFE2E6' },
];

function ProductImage({
  imageUrl,
  slug,
  style,
}: {
  imageUrl?: string;
  slug?: string;
  style?: any;
}) {
  const [loadError, setLoadError] = useState(false);
  const fallback =
    (slug && LOCAL_ASSETS_MAP[slug]) ||
    LOCAL_ASSETS_MAP['leather-tote-bag'] ||
    LOCAL_ASSETS_MAP['1'];

  if (!imageUrl || loadError) {
    return <Image source={fallback} style={style} resizeMode="cover" />;
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={style}
      resizeMode="cover"
      onError={() => setLoadError(true)}
    />
  );
}

// Clean card component with consistent native touch feedback
function PressableCard({ children, style, onPress }: any) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={style}
    >
      {children}
    </TouchableOpacity>
  );
}

// Subtle fade-in section wrapper
function FadeInSection({ children, delay = 0, style }: any) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 350,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [email, setEmail] = useState('');
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({ '1': true });
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';

  const [newArrivals, setNewArrivals] = useState<CardProduct[]>(INITIAL_NEW_ARRIVALS);
  const [favorites, setFavorites] = useState<CardProduct[]>(INITIAL_FAVORITES);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setIsLoading(true);
      try {
        const [newestRes, catRes, categoriesRes] = await Promise.allSettled([
          productsApi.listNewest(10),
          productsApi.list({ limit: 12 }),
          productsApi.listCategories(),
        ]);

        if (!mounted) return;

        if (newestRes.status === 'fulfilled' && newestRes.value.length > 0) {
          setNewArrivals(newestRes.value);
        }
        if (catRes.status === 'fulfilled' && catRes.value.items.length > 0) {
          setFavorites(catRes.value.items);
        }
        if (categoriesRes.status === 'fulfilled' && categoriesRes.value.length > 0) {
          setCategories(categoriesRes.value);
        }
      } catch (err) {
        console.warn('Failed to load products from API:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [newestRes, catRes, categoriesRes] = await Promise.allSettled([
        productsApi.listNewest(10),
        productsApi.list({ limit: 12 }),
        productsApi.listCategories(),
      ]);

      if (newestRes.status === 'fulfilled' && newestRes.value.length > 0) {
        setNewArrivals(newestRes.value);
      }
      if (catRes.status === 'fulfilled' && catRes.value.items.length > 0) {
        setFavorites(catRes.value.items);
      }
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.length > 0) {
        setCategories(categoriesRes.value);
      }
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayedFavorites = useMemo(() => {
    if (!activeCategory || activeCategory === 'All Items' || activeCategory === 'all' || activeCategory === 'All') {
      return favorites;
    }
    const target = activeCategory.toLowerCase();
    const filtered = favorites.filter(item => {
      const slug = item.categorySlug?.toLowerCase() || '';
      const name = item.category?.toLowerCase() || '';
      return slug === target || name === target || slug.includes(target) || name.includes(target);
    });
    return filtered.length > 0 ? filtered : favorites;
  }, [favorites, activeCategory]);

  const toggleLike = (id: string) => {
    setLikedItems(prev => {
      const isNowLiked = !prev[id];
      Toast.info(isNowLiked ? 'Saved to wishlist' : 'Removed from wishlist', 1.2);
      return { ...prev, [id]: isNowLiked };
    });
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: theme.backgroundElement }]}
    >
      <StatusBar
        barStyle={isLight ? 'dark-content' : 'light-content'}
        backgroundColor={theme.backgroundElement}
      />

      <View style={[styles.header, { backgroundColor: theme.backgroundElement, borderBottomColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity accessibilityLabel="Open menu" style={styles.headerBtn} activeOpacity={0.7}>
            <Ionicons name="menu" size={22} color={theme.text} />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Ionicons name="checkmark-circle" size={20} color={theme.text} />
            <Text style={[styles.logoText, { color: theme.text }]}>eco</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity accessibilityLabel="Open bag" onPress={() => router.push('/bag')} style={styles.headerIconBtn} activeOpacity={0.7}>
            <AntBadge dot>
              <Ionicons name="bag-handle-outline" size={22} color={theme.text} />
            </AntBadge>
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel="Open profile" onPress={() => router.push('/profile')} style={styles.headerIconBtn} activeOpacity={0.7}>
            <Ionicons name="person-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.backgroundElement }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.text}
            colors={['#6366f1']}
          />
        }
      >
        {isLoading && !isRefreshing && (
          <View style={styles.loadingWrap}>
            <AntActivityIndicator text="Loading products..." color={theme.text} size="small" />
          </View>
        )}

        <FadeInSection delay={0}>
          <PressableCard style={styles.heroBanner}>
            <View style={[styles.heroGradient, { backgroundColor: isLight ? '#F7F0EA' : '#2C2520' }]}>
              <View style={styles.heroTextContainer}>
                <Text style={[styles.heroEyebrow, { color: theme.textSecondary }]}>In this season, find the best 🔥</Text>
                <Text style={[styles.heroTitle, { color: theme.text }]}>Sports equipment collection.</Text>
                <AntButton
                  type="primary"
                  onPress={() => router.push('/shop')}
                  style={{ ...styles.heroBtn, backgroundColor: theme.text }}
                  activeStyle={styles.heroBtnActive}
                >
                  <View style={styles.heroBtnInner}>
                    <Text style={[styles.heroBtnText, { color: theme.backgroundElement }]}>Start shopping</Text>
                    <Ionicons name="arrow-forward" size={15} color={theme.backgroundElement} />
                  </View>
                </AntButton>
              </View>
              <Image source={require('@/assets/images/hero-right-4.webp')} style={styles.heroImg} resizeMode="contain" />
            </View>
          </PressableCard>
        </FadeInSection>

        <FadeInSection delay={100} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>How it Works</Text>
            <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Find the most suitable items</Text>
          </View>

          <View style={styles.hiwGrid}>
            {[
              { img: require('@/assets/images/HIW1img.webp'), step: 'Step 1', title: 'Filter & Discover', desc: 'Smart filtering and suggestions make it easy to find', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
              { img: require('@/assets/images/HIW2img.webp'), step: 'Step 2', title: 'Add to bag', desc: 'Easily select the correct items and add them to the cart', color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' },
              { img: require('@/assets/images/HIW3img.webp'), step: 'Step 3', title: 'Fast shipping', desc: 'The carrier will confirm and ship quickly to you', color: '#d97706', bg: 'rgba(245, 158, 11, 0.08)' },
              { img: require('@/assets/images/HIW4img.webp'), step: 'Step 4', title: 'Enjoy the product', desc: 'Have fun and enjoy your 5-star quality products', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.08)' },
            ].map((item, index) => (
              <PressableCard key={index} style={[styles.hiwCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                <View style={styles.hiwImgWrap}>
                  <Image source={item.img} style={styles.hiwImg} resizeMode="contain" />
                </View>
                <AntTag style={[styles.hiwStepTag, { backgroundColor: item.bg }]}>
                  <Text style={[styles.hiwStepText, { color: item.color }]}>{item.step}</Text>
                </AntTag>
                <Text style={[styles.hiwCardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.hiwCardDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
              </PressableCard>
            ))}
          </View>
        </FadeInSection>

        {/* New Arrivals */}
        <FadeInSection delay={200} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>New Arrivals</Text>
              <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Our newest products</Text>
            </View>
            <AntButton
              size="small"
              onPress={() => router.push('/shop')}
              style={{ ...styles.seeAllBtn, backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }}
              activeStyle={{ opacity: 0.7 }}
            >
              <View style={styles.seeAllInner}>
                <Text style={[styles.seeAllText, { color: theme.text }]}>See all</Text>
                <Text style={[styles.seeAllArrow, { color: theme.text }]}>→</Text>
              </View>
            </AntButton>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {newArrivals.map((item) => (
              <PressableCard
                key={item.id}
                onPress={() => router.push('/shop')}
                style={[styles.miniCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}
              >
                <View style={styles.miniCardImgWrap}>
                  <ProductImage imageUrl={item.image} slug={item.slug} style={styles.miniCardImg} />
                  {item.tag && (
                    <AntTag style={[styles.productTagBase, item.tag.includes('🔥') ? styles.badgeHot : styles.badgeNew]}>
                      <Text style={[styles.badgeText, item.tag.includes('🔥') && styles.badgeHotText]}>{item.tag}</Text>
                    </AntTag>
                  )}
                </View>
                <View style={styles.miniCardBody}>
                  {/* Color swatches */}
                  <View style={styles.colorSwatches}>
                    {item.colors.map((c, i) => (
                      <View key={i} style={[styles.colorDot, { backgroundColor: c }, c === '#fff' && styles.colorDotWhite]} />
                    ))}
                  </View>
                  <Text style={[styles.miniCardName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.priceRow}>
                    <View style={styles.favPriceTag}>
                      <Text style={styles.favPriceText}>{item.price}</Text>
                    </View>
                    {item.oldPrice && <Text style={styles.miniCardOldPrice}>{item.oldPrice}</Text>}
                  </View>
                </View>
              </PressableCard>
            ))}
          </ScrollView>
        </FadeInSection>

        {/* Special Offer */}
        <FadeInSection delay={300}>
          <View style={[styles.specialContainer, { backgroundColor: isLight ? '#F9FAFB' : '#18181B', borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
            <View style={styles.specialContent}>
              <Text style={[styles.specialTitle, { color: theme.text }]}>Don't miss out on{'\n'}special offers.</Text>
              <Text style={[styles.specialDesc, { color: theme.textSecondary }]}>Register to receive news about the latest, savings combos, discount codes.</Text>
              
              <View style={styles.specialPointsList}>
                {SPECIAL_OFFER_POINTS.map((pt) => (
                  <View key={pt.id} style={styles.specialPointRow}>
                    <AntTag style={[styles.specialPointTag, { backgroundColor: pt.bg }]}>
                      <Text style={[styles.specialPointBadgeText, { color: pt.color }]}>{pt.id}</Text>
                    </AntTag>
                    <Text style={[styles.specialPointText, { color: isLight ? '#374151' : '#E5E7EB' }]}>{pt.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.specialInputRow}>
                <TextInput
                  style={[styles.specialInput, { backgroundColor: isLight ? '#FFFFFF' : '#212225', color: theme.text, borderColor: isLight ? '#E5E7EB' : '#2D2D30' }]}
                  placeholder="Your email address"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <AntButton
                  type="primary"
                  style={{ ...styles.specialBtn, backgroundColor: theme.text }}
                  activeStyle={{ opacity: 0.85 }}
                  onPress={() => {
                    if (!email.trim()) {
                      Toast.info('Please enter your email', 1.5);
                      return;
                    }
                    setEmail('');
                    Toast.success('Subscribed to special offers!', 2);
                  }}
                >
                  <Ionicons name="arrow-forward" size={18} color={theme.backgroundElement} />
                </AntButton>
              </View>
            </View>
          </View>
        </FadeInSection>

        {/* Find Your Favourite */}
        <FadeInSection delay={400} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Find your Favourite</Text>
              <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Recommended for you</Text>
            </View>
            <AntButton
              size="small"
              onPress={() => router.push('/shop')}
              style={{ ...styles.seeAllBtn, backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }}
              activeStyle={{ opacity: 0.7 }}
            >
              <View style={styles.seeAllInner}>
                <Text style={[styles.seeAllText, { color: theme.text }]}>See all</Text>
                <Text style={[styles.seeAllArrow, { color: theme.text }]}>→</Text>
              </View>
            </AntButton>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
            style={{ marginBottom: 16 }}
          >
            {categories.map((cat) => {
              const isSelected = activeCategory.toLowerCase() === cat.name.toLowerCase() || activeCategory.toLowerCase() === cat.slug.toLowerCase();
              return (
                <AntTag
                  key={cat.id || cat.slug || cat.name}
                  selected={isSelected}
                  onChange={() => setActiveCategory(cat.name)}
                  style={[
                    styles.catChipTag,
                    isSelected
                      ? { backgroundColor: theme.text, borderColor: theme.text }
                      : { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }
                  ]}
                >
                  <Text style={[styles.catChipText, isSelected ? { color: theme.backgroundElement, fontWeight: '700' } : { color: theme.textSecondary }]}>
                    {cat.name}
                  </Text>
                </AntTag>
              );
            })}
          </ScrollView>

          <View style={styles.favoritesGrid}>
            {displayedFavorites.map((item) => (
              <PressableCard
                key={item.id}
                onPress={() => router.push('/shop')}
                style={[styles.favCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}
              >
                <View style={styles.favCardImgWrap}>
                  <ProductImage imageUrl={item.image} slug={item.slug} style={styles.favCardImg} />
                  {item.tag && (
                    <AntTag style={[styles.productTagBase, styles.badgeNew]}>
                      <Text style={styles.badgeText}>{item.tag}</Text>
                    </AntTag>
                  )}
                  <TouchableOpacity
                    style={[styles.heartBtn, likedItems[item.id] && styles.heartBtnActive]}
                    onPress={() => toggleLike(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={likedItems[item.id] ? "heart" : "heart-outline"}
                      size={18}
                      color={likedItems[item.id] ? "#ef4444" : "#6b7280"}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.favCardBody}>
                  {/* Color swatches */}
                  <View style={styles.colorSwatches}>
                    {item.colors.map((c, i) => (
                      <View key={i} style={[styles.colorDot, { backgroundColor: c }, c === '#fff' && styles.colorDotWhite]} />
                    ))}
                  </View>
                  <Text style={[styles.favCardName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                  <Text style={[styles.favCardSub, { color: theme.textSecondary }]} numberOfLines={1}>{item.subtitle}</Text>
                  <View style={styles.favCardFooter}>
                    <View style={styles.favPriceTag}>
                      <Text style={styles.favPriceText}>{item.price}</Text>
                    </View>
                    <View style={styles.favRating}>
                      <Text style={styles.starIcon}>★</Text>
                      <Text style={[styles.ratingText, { color: theme.textSecondary }]}>{item.rating}</Text>
                    </View>
                  </View>
                </View>
              </PressableCard>
            ))}
          </View>
        </FadeInSection>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // ─── Header ────────────────────────────────────────
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 4,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE8E3',
    backgroundColor: '#ffffff',
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 6,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bagStatusDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22c55e',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },

  // ─── Scroll ────────────────────────────────────────
  scrollContent: {
    paddingBottom: 24,
  },

  loadingWrap: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Hero Banner ───────────────────────────────────
  heroBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    backgroundColor: '#F7F0EA',
    padding: 20,
    flexDirection: 'row',
    minHeight: 200,
  },
  heroTextContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  heroTitle: {
    width: 170,
    fontSize: 21,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 27,
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  heroBtn: {
    height: 40,
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    borderRadius: 99,
    alignSelf: 'flex-start',
    borderWidth: 0,
    justifyContent: 'center',
  },
  heroBtnActive: {
    opacity: 0.85,
  },
  heroBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  heroImg: {
    position: 'absolute',
    right: -10,
    bottom: 0,
    width: 170,
    height: 176,
    zIndex: 1,
  },

  // ─── Sections ──────────────────────────────────────
  section: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '400',
  },
  seeAllBtn: {
    height: 28,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  seeAllArrow: {
    fontSize: 12,
    color: '#4B5563',
  },

  // ─── How It Works ──────────────────────────────────
  hiwGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hiwCard: {
    width: (width - 44) / 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#EAE8E3',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
  },
  hiwImgWrap: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  hiwImg: {
    width: '100%',
    height: '100%',
  },
  hiwStepBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  hiwStepTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 0,
    height: 'auto',
  },
  hiwStepText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hiwCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 3,
    textAlign: 'center',
  },
  hiwCardDesc: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    textAlign: 'center',
  },

  // ─── New Arrivals Cards ────────────────────────────
  horizontalScroll: {
    paddingRight: 20,
  },
  miniCard: {
    width: 154,
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAE8E3',
    elevation: 1,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  miniCardImgWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  miniCardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  miniCardBody: {
    padding: 12,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorDotWhite: {
    borderColor: 'rgba(0,0,0,0.2)',
  },
  miniCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniCardOldPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },

  // ─── Badges ────────────────────────────────────────
  productTagBase: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderWidth: 0,
    height: 'auto',
    zIndex: 2,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeNew: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#ffffff',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  badgeHot: {
    backgroundColor: '#FEF2F2',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#111111',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeHotText: {
    color: '#EF4444',
  },

  // ─── Special Offer ─────────────────────────────────
  specialContainer: {
    marginHorizontal: 16,
    marginTop: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAE8E3',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  specialContent: {
    padding: 20,
  },
  specialTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 26,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  specialDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
    marginBottom: 14,
  },
  specialPointsList: {
    gap: 8,
    marginBottom: 18,
  },
  specialPointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  specialPointBadge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  specialPointTag: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 0,
    height: 'auto',
  },
  specialPointBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  specialPointText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  specialInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  specialInput: {
    flex: 1,
    height: 44,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#111111',
  },
  specialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Categories & Tabs ─────────────────────────────
  categoryScroll: {
    paddingRight: 16,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#EAE8E3',
    marginRight: 8,
  },
  catChipTag: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 99,
    marginRight: 8,
    height: 'auto',
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },

  // ─── Favourites Grid ───────────────────────────────
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  favCard: {
    width: (width - 44) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAE8E3',
    marginBottom: 4,
    elevation: 1,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  favCardImgWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    position: 'relative',
  },
  favCardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  heartBtnActive: {
    backgroundColor: '#FEF2F2',
  },
  favCardBody: {
    padding: 12,
  },
  favCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 2,
  },
  favCardSub: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  favCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favPriceTag: {
    borderWidth: 1.5,
    borderColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 7,
    backgroundColor: 'transparent',
  },
  favPriceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
  },
  favRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  starIcon: {
    color: '#FACC15',
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
});
