import React, { useState, useEffect, useMemo, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  RefreshControl,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { QuickAddButton } from '@/components/product/QuickAddButton';
import { Reveal as FadeInSection } from '@/components/ui/motion';
import { productsApi, CardProduct, CategoryItem } from '@/services/products-api';
import {
  Button as AntButton,
  Card as AntCard,
  Badge as AntBadge,
  InputItem as AntInputItem,
  Toast,
  ActivityIndicator as AntActivityIndicator,
} from '@ant-design/react-native';
import { ThemeContext as AntThemeContext, ThemeProvider as AntThemeProvider } from '@ant-design/react-native/lib/style';

// Card.Body renders children, but the installed package omits them from its declaration.
const AntCardBody = AntCard.Body as React.ComponentType<
  React.PropsWithChildren<React.ComponentProps<typeof AntCard.Body>>
>;

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
  { id: '1', slug: 'leather-tote-bag', name: 'Leather Tote Bag', price: '₹85.00', oldPrice: '₹99.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1.webp', subtitle: 'Pink Yarrow', tag: 'New', colors: ['#000000', '#7B4214'], rating: '4.5', category: 'Bags', categorySlug: 'bags', inStock: true },
  { id: '2', slug: 'silk-midi-dress', name: 'Silk Midi Dress', price: '₹120.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2.webp', subtitle: 'Emerald Green', tag: 'Hot 🔥', colors: ['#3B9668', '#060A82'], rating: '4.7', category: 'Women', categorySlug: 'women', inStock: true },
  { id: '3', slug: 'denim-jacket', name: 'Denim Jacket', price: '₹65.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p3.webp', subtitle: 'Light Blue', tag: 'New', colors: ['#ADD8E6', '#000000'], rating: '4.3', category: 'Jackets', categorySlug: 'jackets', inStock: true },
  { id: '4', slug: 'cashmere-sweater', name: 'Cashmere Sweater', price: '₹150.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p4.webp', subtitle: 'Cream', colors: ['#3B474E', '#FC9FAF'], rating: '4.8', category: 'Men', categorySlug: 'men', inStock: true },
  { id: '5', slug: 'linen-blazer', name: 'Linen Blazer', price: '₹95.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p5.webp', subtitle: 'Beige', tag: 'New', colors: ['#F5DEB3', '#808080'], rating: '4.4', category: 'Men', categorySlug: 'men', inStock: true },
  { id: '6', slug: 'velvet-skirt', name: 'Velvet Skirt', price: '₹55.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p6.webp', subtitle: 'Wine Red', tag: 'Hot 🔥', colors: ['#722F37', '#191970'], rating: '4.6', category: 'Women', categorySlug: 'women', inStock: true },
];

const INITIAL_FAVORITES: CardProduct[] = [
  { id: '1', slug: 'leather-tote-bag', name: 'Leather Tote Bag', price: '₹85.00', oldPrice: '₹99.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1.webp', subtitle: 'Pink Yarrow', tag: 'New', colors: ['#000000', '#7B4214'], rating: '4.5', category: 'Bags', categorySlug: 'bags', inStock: true },
  { id: '2', slug: 'silk-midi-dress', name: 'Silk Midi Dress', price: '₹120.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p2.webp', subtitle: 'Emerald Green', tag: 'Hot 🔥', colors: ['#3B9668', '#060A82'], rating: '4.7', category: 'Women', categorySlug: 'women', inStock: true },
  { id: '4', slug: 'cashmere-sweater', name: 'Cashmere Sweater', price: '₹150.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p4.webp', subtitle: 'Cream', colors: ['#3B474E', '#FC9FAF'], rating: '4.8', category: 'Men', categorySlug: 'men', inStock: true },
  { id: '6', slug: 'velvet-skirt', name: 'Velvet Skirt', price: '₹55.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p6.webp', subtitle: 'Wine Red', tag: 'Hot 🔥', colors: ['#722F37', '#191970'], rating: '4.6', category: 'Women', categorySlug: 'women', inStock: true },
  { id: '7', slug: 'sunrise-on-the-red-sand-dunes', name: 'Sunrise On The Red Sand Dunes', price: '₹180.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p7.webp', subtitle: 'Eau de Parfum', tag: 'New', colors: ['#D4AF37', '#A0522D'], rating: '4.9', category: 'Fragrance', categorySlug: 'fragrance', inStock: true },
  { id: '8', slug: 'zara-lisboa-seoul', name: 'Zara Lisboa & Seoul', price: '₹45.00', image: 'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p8.webp', subtitle: 'Eau de Toilette', colors: ['#1E40AF', '#4B0082'], rating: '4.5', category: 'Fragrance', categorySlug: 'fragrance', inStock: true },
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
  if (!onPress) return <View style={style}>{children}</View>;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.88}
      onPress={onPress}
      style={style}
    >
      {children}
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const contentWidth = Math.min(windowWidth, 720);
  const gridCardWidth = (contentWidth - 52) / 2;
  const favouriteCardWidth = (contentWidth - 56) / 2;
  const isLight = theme.background === '#F8F7F4';
  const inheritedAntTheme = useContext(AntThemeContext);
  // Scope the Ant Design treatment to this screen; the marked hero uses its original styles.
  const ui = useMemo(() => ({
    ...inheritedAntTheme,
    brand_primary: theme.text,
    brand_primary_tap: isLight ? '#303033' : '#DEDEE3',
    primary_button_fill: theme.text,
    primary_button_fill_tap: isLight ? '#303033' : '#DEDEE3',
    ghost_button_color: theme.text,
    color_text_base: theme.text,
    color_text_base_inverse: theme.backgroundElement,
    color_text_caption: isLight ? '#68686B' : '#AFB2BA',
    border_color_base: isLight ? '#E6E6E2' : '#38393E',
    fill_base: theme.backgroundElement,
    fill_tap: isLight ? '#F4F4F2' : '#303137',
    font_size_base: 14,
    font_size_caption: 12,
    font_size_subhead: 15,
    font_size_heading: 20,
    radius_sm: 8,
    radius_md: 16,
    radius_lg: 20,
    h_spacing_sm: 4,
    h_spacing_md: 8,
    h_spacing_lg: 16,
    v_spacing_sm: 8,
    v_spacing_md: 12,
    v_spacing_lg: 16,
    v_spacing_xl: 24,
    button_height: 48,
    button_height_sm: 44,
    button_font_size: 14,
    button_font_size_sm: 13,
  }), [inheritedAntTheme, isLight, theme]);
  const menuColors = {
    surface: isLight ? '#F6F5F1' : '#292B29',
    border: isLight ? '#E8E7E2' : '#393C39',
    accent: isLight ? '#78856A' : '#A9B79B',
  };
  const { cartCount } = useCart();
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();

  const safeTop = insets.top > 0 ? insets.top : (Platform.OS === 'ios' ? 54 : 24);
  const safeBottom = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 34 : 16);

  const [activeCategory, setActiveCategory] = useState('All Items');
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({ '1': true });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <AntThemeProvider value={ui}>
      <SafeAreaView
        edges={['top']}
        style={[styles.safeArea, { backgroundColor: theme.backgroundElement }]}
      >
        <StatusBar style={isLight ? 'dark' : 'light'} />

        {/* ─── Header ──────────────────────────────────────── */}
        <View style={[styles.header, { backgroundColor: theme.backgroundElement, borderBottomColor: isLight ? '#EEEDE9' : '#2D2D30' }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open menu"
              style={styles.headerBtn}
              activeOpacity={0.7}
              onPress={() => setIsMenuOpen(true)}
            >
              <Ionicons name="menu" size={22} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <FontAwesome5 name="hand-peace" size={19} color={theme.text} solid />
              <Text style={[styles.logoText, { color: theme.text }]}>eco</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open bag"
              onPress={() => {
                if (isAuthLoading) {
                  Toast.info('Please wait while we check your sign-in status', 1.5);
                  return;
                }
                if (!isAuthenticated) {
                  Toast.info('Please sign in to view your bag', 1.5);
                  router.push('/login');
                  return;
                }
                router.push('/bag');
              }}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
              <AntBadge dot={cartCount > 0}>
                <Ionicons name="bag-handle-outline" size={22} color={theme.text} />
              </AntBadge>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              onPress={() => router.push(isAuthenticated ? '/profile' : '/login')}
              style={styles.headerIconBtn}
              activeOpacity={0.7}
            >
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

          {/* ─── Hero Banner ─────────────────────────────────── */}
          <FadeInSection delay={0}>
            <PressableCard style={styles.heroBanner}>
              <View style={[styles.heroGradient, { backgroundColor: isLight ? '#F7F0EA' : '#2C2520' }]}>
                <View style={styles.heroTextContainer}>
                  <Text style={[styles.heroEyebrow, { color: theme.textSecondary }]}>Gear up for the season</Text>
                  <Text accessibilityRole="header" style={[styles.heroTitle, { color: theme.text, width: Math.min(190, contentWidth * 0.46) }]}>Sports equipment collection.</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Shop the sports equipment collection"
                    onPress={() => router.push('/shop')}
                    style={[styles.heroBtn, { backgroundColor: theme.text }]}
                    activeOpacity={0.85}
                  >
                    <View style={styles.heroBtnInner}>
                      <Text style={[styles.heroBtnText, { color: theme.backgroundElement }]}>Shop collection</Text>
                      <Ionicons name="arrow-forward" size={15} color={theme.backgroundElement} />
                    </View>
                  </TouchableOpacity>
                </View>
                <Image source={require('@/assets/images/hero-right-4.webp')} style={[styles.heroImg, { width: Math.min(184, contentWidth * 0.42) }]} resizeMode="contain" accessible={false} />
              </View>
            </PressableCard>
          </FadeInSection>

          {/* ─── How it Works ────────────────────────────────── */}
          <FadeInSection delay={100} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>How it works</Text>
              <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>A quick guide to your first order.</Text>
            </View>

            <View style={styles.hiwGrid}>
              {[
                { img: require('@/assets/images/HIW1img.webp'), title: 'Browse & discover', desc: 'Use filters to find the right item.' },
                { img: require('@/assets/images/HIW2img.webp'), title: 'Add to bag', desc: 'Choose your options, then add to bag.' },
                { img: require('@/assets/images/HIW3img.webp'), title: 'On its way', desc: 'We confirm your order before dispatch.' },
                { img: require('@/assets/images/HIW4img.webp'), title: 'All yours', desc: 'Unpack your order. You’re all set.' },
              ].map((item, index) => (
                <AntCard key={item.title} style={[styles.hiwCard, { width: gridCardWidth, borderRadius: ui.radius_md, borderColor: ui.border_color_base }]}>
                  <AntCardBody style={styles.hiwCardBody}>
                    <View style={styles.hiwCardTop}>
                      <View style={styles.hiwImgWrap}>
                        <Image source={item.img} style={styles.hiwImg} resizeMode="contain" accessible={false} />
                      </View>
                      <View accessible accessibilityRole="text" accessibilityLabel={`Step ${index + 1} of 4`}>
                        <AntBadge text={String(index + 1).padStart(2, '0')} styles={{
                          textDom: { position: 'relative', top: 0, right: 0, minWidth: 26, height: 26, borderRadius: ui.radius_sm, paddingHorizontal: 6, paddingVertical: 4, backgroundColor: ui.fill_tap },
                          text: { color: ui.color_text_caption, fontSize: ui.font_size_caption, lineHeight: 18, fontWeight: '500', fontVariant: ['tabular-nums'] },
                        }} />
                      </View>
                    </View>
                    <Text style={[styles.hiwCardTitle, { color: ui.color_text_base, fontSize: ui.font_size_subhead }]}>{item.title}</Text>
                    <Text style={[styles.hiwCardDesc, { color: ui.color_text_caption, fontSize: ui.font_size_base }]}>{item.desc}</Text>
                  </AntCardBody>
                </AntCard>
              ))}
            </View>
          </FadeInSection>

          {/* ─── New Arrivals ────────────────────────────────── */}
          <FadeInSection delay={200} style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text accessibilityRole="header" style={[styles.sectionTitle, { color: theme.text }]}>New arrivals</Text>
              </View>
              <AntButton
                size="small"
                onPress={() => router.push('/shop')}
                style={styles.seeAllBtn}
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
                <AntCard
                  key={item.id}
                  style={[styles.miniCard, { width: Math.min(194, gridCardWidth), backgroundColor: theme.backgroundElement, borderColor: ui.border_color_base, borderRadius: ui.radius_md }]}
                >
                  <AntCardBody style={styles.productCardBody}>
                    <TouchableOpacity
                      activeOpacity={0.88}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${item.name}`}
                      onPress={() => router.push(`/product/${item.slug || item.id}` as any)}
                    >
                      <View style={styles.miniCardImgWrap}>
                        <ProductImage imageUrl={item.image} slug={item.slug} style={styles.miniCardImg} />
                        {item.tag && (
                          <View style={[styles.badge, (item.tag.includes('🔥') || item.tag.toLowerCase().includes('hot')) ? styles.badgeHot : styles.badgeNew]}>
                            <Text style={[styles.badgeText, (item.tag.includes('🔥') || item.tag.toLowerCase().includes('hot')) && styles.badgeHotText]}>{item.tag}</Text>
                          </View>
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
                      </View>
                    </TouchableOpacity>
                    <View style={styles.miniCardFooter}>
                      <View style={styles.miniCardPrices}>
                        <Text style={[styles.miniCardPrice, { color: theme.text }]}>{item.price}</Text>
                        {item.oldPrice && <Text style={[styles.miniCardOldPrice, { color: theme.textSecondary }]}>{item.oldPrice}</Text>}
                      </View>
                      <QuickAddButton product={item} />
                    </View>
                  </AntCardBody>
                </AntCard>
              ))}
            </ScrollView>
          </FadeInSection>

          {/* ─── Special Offer ───────────────────────────────── */}
          <FadeInSection delay={300}>
            <View style={[styles.specialContainer, { backgroundColor: isLight ? '#F9FAFB' : '#18181B', borderColor: isLight ? '#ECEBE7' : '#2D2D30' }]}>
              <View style={styles.specialContent}>
                <Text style={[styles.specialTitle, { color: theme.text }]}>Don't miss out on{'\n'}special offers.</Text>
                <Text style={[styles.specialDesc, { color: theme.textSecondary }]}>Register to receive news about the latest, savings combos, discount codes.</Text>

                <View style={styles.specialPointsList}>
                  {SPECIAL_OFFER_POINTS.map((pt) => (
                    <View key={pt.id} style={styles.specialPointRow}>
                      <View style={[styles.specialPointBadge, { backgroundColor: pt.bg }]}>
                        <Text style={[styles.specialPointBadgeText, { color: pt.color }]}>{pt.id}</Text>
                      </View>
                      <Text style={[styles.specialPointText, { color: isLight ? '#374151' : '#E5E7EB' }]}>{pt.label}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.specialInputRow}>
                  <View style={[styles.specialInput, { backgroundColor: ui.fill_base, borderColor: emailFocused ? ui.brand_primary : ui.border_color_base }]}>
                    <AntInputItem
                      last
                      clear
                      accessibilityLabel="Your email address"
                      styles={{ container: styles.specialInputContainer, input: { fontSize: ui.font_size_base, color: ui.color_text_base } }}
                      placeholder="Your email address"
                      placeholderTextColor={ui.color_text_caption}
                      value={email}
                      onChange={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      type="email-address"
                      autoCapitalize="none"
                    />
                  </View>
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

          {/* ─── Find Your Favourite ─────────────────────────── */}
          <FadeInSection delay={400} style={[styles.section, styles.favouritesSection]}>
            <View style={[styles.sectionHeaderRow, styles.favouritesHeader]}>
              <View style={styles.favouritesHeadingCopy}>
                <Text accessibilityRole="header" style={[styles.sectionTitle, styles.favouritesTitle, { color: theme.text }]}>Find your favourites</Text>
                <Text style={[styles.sectionSub, styles.favouritesSubtitle, { color: theme.textSecondary }]}>Recommended for you</Text>
              </View>
              <AntButton
                size="small"
                onPress={() => router.push('/shop')}
                style={styles.seeAllBtn}
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
              style={styles.favouritesFilters}
            >
              {categories.map((cat) => {
                const isSelected = activeCategory.toLowerCase() === cat.name.toLowerCase() || activeCategory.toLowerCase() === cat.slug.toLowerCase();
                return (
                  <AntButton
                    key={cat.id || cat.slug || cat.name}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setActiveCategory(cat.name)}
                    type={isSelected ? 'primary' : 'ghost'}
                    size="small"
                    activeStyle={{ opacity: 0.75 }}
                    styles={{
                      underlayStyle: { width: 'auto' },
                      smallUnderlayContainerRaw: { paddingLeft: 20, paddingRight: 20 },
                      smallRawText: { fontSize: ui.button_font_size_sm, fontWeight: isSelected ? '600' : '500' },
                      ghostRawText: { color: ui.color_text_caption },
                    }}
                    style={StyleSheet.flatten([
                      styles.catChip,
                      isSelected
                        ? { backgroundColor: theme.text, borderColor: theme.text }
                        : { backgroundColor: ui.fill_base, borderColor: ui.border_color_base }
                    ])}
                  >
                    {cat.name}
                  </AntButton>
                );
              })}
            </ScrollView>

            <View style={styles.favoritesGrid}>
              {displayedFavorites.map((item) => (
                <AntCard key={item.id} style={[styles.favCard, { width: favouriteCardWidth, borderRadius: ui.radius_md, borderColor: ui.border_color_base }]}>
                  <AntCardBody style={styles.productCardBody}>
                    <TouchableOpacity
                      activeOpacity={0.92}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${item.name}`}
                      onPress={() => router.push(`/product/${item.slug || item.id}` as any)}
                    >
                      <View style={styles.favCardImgWrap}>
                        <ProductImage imageUrl={item.image} slug={item.slug} style={styles.favCardImg} />
                        {item.tag && (
                          <View style={[styles.badge, (item.tag.includes('🔥') || item.tag.toLowerCase().includes('hot')) ? styles.badgeHot : styles.badgeNew]}>
                            <Text style={[styles.badgeText, (item.tag.includes('🔥') || item.tag.toLowerCase().includes('hot')) && styles.badgeHotText]}>{item.tag}</Text>
                          </View>
                        )}
                        <TouchableOpacity
                          style={[styles.heartBtn, likedItems[item.id] && styles.heartBtnActive]}
                          accessibilityRole="button"
                          accessibilityLabel={`${likedItems[item.id] ? 'Remove' : 'Save'} ${item.name} ${likedItems[item.id] ? 'from' : 'to'} wishlist`}
                          accessibilityState={{ selected: !!likedItems[item.id] }}
                          hitSlop={6}
                          onPress={(event) => {
                            event.stopPropagation();
                            toggleLike(item.id);
                          }}
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
                        <View style={styles.favCardSubRow}>
                          <Text style={[styles.favCardSub, { color: theme.textSecondary }]} numberOfLines={1}>{item.subtitle}</Text>
                          <View style={styles.favRating}>
                            <Text style={styles.starIcon}>★</Text>
                            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>{item.rating}</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                    <View style={styles.favCardFooter}>
                      <View style={styles.favCardPrices}>
                        <Text style={[styles.favPriceText, { color: theme.text }]}>{item.price}</Text>
                        {item.oldPrice && (
                          <Text style={[styles.favOldPriceText, { color: theme.textSecondary }]}>
                            {item.oldPrice}
                          </Text>
                        )}
                      </View>
                      <QuickAddButton product={item} />
                    </View>
                  </AntCardBody>
                </AntCard>
              ))}
            </View>
          </FadeInSection>

        </ScrollView>

        {/* ─── FULL SCREEN NAVIGATION MODAL ────────────────── */}
        <Modal
          visible={isMenuOpen}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <View
            style={[
              styles.fullScreenContainer,
              {
                backgroundColor: theme.backgroundElement,
                paddingTop: safeTop,
              },
            ]}
          >
            <StatusBar style={isLight ? 'dark' : 'light'} />
            <View style={[styles.fullScreenHeader, { borderBottomColor: menuColors.border }]}>
              <View style={styles.logoContainer}>
                <FontAwesome5 name="hand-peace" size={19} color={theme.text} solid />
                <Text style={[styles.logoText, { color: theme.text }]}>eco</Text>
              </View>

              <TouchableOpacity
                onPress={() => setIsMenuOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="Close navigation menu"
                style={[styles.fullScreenClose, { backgroundColor: isLight ? '#F4F4F6' : '#27272A' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.fullScreenContent, { paddingBottom: safeBottom + 8 }]}>
              <View style={styles.primaryNavList}>
                {[
                  { name: 'New Arrivals', filter: 'all', badge: 'NEW' },
                  { name: 'Women', filter: 'women' },
                  { name: 'Men', filter: 'men' },
                  { name: 'Bags', filter: 'bags' },
                  { name: 'Jackets', filter: 'jackets' },
                  { name: 'Fragrance', filter: 'fragrance' },
                  { name: 'Beauty', filter: 'beauty' },
                  { name: 'All Items', filter: 'all' },
                ].map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.primaryNavRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setIsMenuOpen(false);
                      setActiveCategory(item.filter);
                      router.push('/shop');
                    }}
                  >
                    <View style={styles.navRowLeft}>
                      <Text style={[styles.primaryNavText, { color: theme.text }]}>{item.name}</Text>
                      {item.badge && (
                        <View style={[styles.menuBadgePill, { backgroundColor: isLight ? '#111111' : '#FFFFFF' }]}>
                          <Text style={[styles.menuBadgeText, { color: isLight ? '#FFFFFF' : '#111111' }]}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={15} color={isLight ? '#C7C7CC' : '#52525B'} />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                activeOpacity={0.86}
                accessibilityRole="button"
                accessibilityLabel="Shop the seasonal collection"
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/shop');
                }}
                style={[styles.editFeature, { backgroundColor: menuColors.surface }]}
              >
                <View style={styles.editCopy}>
                  <Text style={[styles.editEyebrow, { color: menuColors.accent }]}>SS26 · DROP 01</Text>
                  <Text style={[styles.editTitle, { color: theme.text }]}>
                    Sustainable{'\n'}Essentials
                  </Text>
                  <View style={styles.editLinkRow}>
                    <Text style={[styles.editLink, { color: theme.text }]}>Shop the drop</Text>
                    <Ionicons name="arrow-forward" size={16} color={theme.text} />
                  </View>
                </View>
                <View style={styles.editImageFrame}>
                  <Image
                    source={require('@/assets/images/p3.webp')}
                    style={styles.editImage}
                    resizeMode="cover"
                    accessible={false}
                  />
                </View>
              </TouchableOpacity>

              <View style={[styles.accountPanel, { borderTopColor: menuColors.border }]}>
                <Text style={[styles.accountEyebrow, { color: theme.textSecondary }]}>ACCOUNT</Text>
                {isAuthenticated ? (
                  <View style={styles.accountMemberRow}>
                    <View style={[styles.accountAvatar, { backgroundColor: menuColors.surface }]}>
                      <Text style={[styles.accountAvatarText, { color: theme.text }]}>
                        {(user?.fullName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.accountMemberCopy}>
                      <Text style={[styles.accountMemberName, { color: theme.text }]} numberOfLines={1}>
                        {user?.fullName || 'Eco Member'}
                      </Text>
                      <Text style={[styles.accountMemberEmail, { color: theme.textSecondary }]} numberOfLines={1}>
                        {user?.email || 'Logged in'}
                      </Text>
                    </View>
                    <AntButton
                      type="ghost"
                      size="small"
                      accessibilityRole="button"
                      accessibilityLabel="Logout"
                      onPress={() => {
                        setIsMenuOpen(false);
                        void logout();
                      }}
                      style={styles.accountLogoutButton}
                      activeStyle={styles.accountLogoutButtonActive}
                    >
                      <Text style={[styles.accountLogoutText, { color: theme.text }]}>Logout</Text>
                    </AntButton>
                  </View>
                ) : (
                  <View style={styles.guestAccountActions}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Sign in"
                      onPress={() => {
                        setIsMenuOpen(false);
                        router.push('/login');
                      }}
                      style={styles.guestSignInButton}
                    >
                      <Text style={[styles.guestSignInText, { color: theme.text }]}>Sign in</Text>
                    </TouchableOpacity>
                    <AntButton
                      type="primary"
                      size="small"
                      accessibilityRole="button"
                      accessibilityLabel="Create account"
                      onPress={() => {
                        setIsMenuOpen(false);
                        router.push('/signup');
                      }}
                      style={{ ...styles.guestCreateButton, backgroundColor: theme.text, borderColor: theme.text }}
                      activeStyle={styles.guestCreateButtonActive}
                    >
                      <Text style={[styles.guestCreateText, { color: theme.backgroundElement }]}>Create account</Text>
                    </AntButton>
                  </View>
                )}
              </View>

            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </AntThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // ─── Header ────────────────────────────────────────
  header: {
    height: 60,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEDE9',
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
    marginLeft: 8,
  },
  logoText: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '700',
    color: '#111111',
    letterSpacing: -0.7,
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

  // ─── Scroll ────────────────────────────────────────
  scrollContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingBottom: 32,
  },

  loadingWrap: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Hero Banner ───────────────────────────────────
  heroBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 22,
    overflow: 'hidden',
  },
  heroGradient: {
    backgroundColor: '#F7F0EA',
    padding: 22,
    flexDirection: 'row',
    minHeight: 212,
  },
  heroTextContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  heroEyebrow: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 10,
    letterSpacing: 0,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 29,
    marginBottom: 18,
    letterSpacing: -0.7,
  },
  heroBtn: {
    height: 44,
    backgroundColor: '#111111',
    paddingHorizontal: 18,
    borderRadius: 24,
    alignSelf: 'flex-start',
    borderWidth: 0,
    justifyContent: 'center',
  },
  heroBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroBtnText: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  heroImg: {
    position: 'absolute',
    right: -8,
    bottom: 0,
    height: 184,
    zIndex: 1,
  },

  // ─── Sections ──────────────────────────────────────
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '600',
    color: '#111111',
    letterSpacing: -0.5,
  },
  sectionSub: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    marginTop: 3,
    fontWeight: '400',
  },
  seeAllBtn: {
    height: 44,
    backgroundColor: 'transparent',
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seeAllInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ECEBE7',
    paddingBottom: 0,
    shadowColor: '#151518',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },
  hiwCardBody: {
    borderTopWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 176,
    alignItems: 'flex-start',
  },
  hiwCardTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  hiwImgWrap: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiwImg: {
    width: '100%',
    height: '100%',
  },
  hiwCardTitle: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    color: '#111111',
    marginBottom: 6,
    textAlign: 'left',
    letterSpacing: -0.2,
  },
  hiwCardDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 20,
    textAlign: 'left',
  },

  // ─── New Arrivals Cards ────────────────────────────
  horizontalScroll: {
    paddingRight: 4,
    paddingBottom: 2,
  },
  miniCard: {
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECEBE7',
    paddingBottom: 0,
  },
  productCardBody: {
    borderTopWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
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
    paddingHorizontal: 12,
    paddingTop: 14,
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorDotWhite: {
    borderColor: 'rgba(0,0,0,0.2)',
  },
  miniCardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111111',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  miniCardFooter: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  miniCardPrices: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  miniCardPrice: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  miniCardOldPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },

  // ─── Badges ────────────────────────────────────────
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNew: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  badgeHot: {
    backgroundColor: '#FEF2F2',
    borderWidth: 0.5,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  badgeText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    color: '#111111',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  badgeHotText: {
    color: '#EF4444',
  },

  // ─── Special Offer ─────────────────────────────────
  specialContainer: {
    marginHorizontal: 20,
    marginTop: 30,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#EAE8E3',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  specialContent: {
    padding: 22,
  },
  specialTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 29,
    letterSpacing: -0.5,
    marginBottom: 8,
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
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  specialInputContainer: {
    height: 48,
    marginLeft: 0,
    borderBottomWidth: 0,
    paddingLeft: 14,
    paddingRight: 14,
  },
  specialBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Categories & Tabs ─────────────────────────────
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 20,
    paddingVertical: 2,
  },
  catChip: {
    height: 44,
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ─── Favourites Grid ───────────────────────────────
  favouritesSection: {
    marginTop: 40,
  },
  favouritesHeader: {
    marginBottom: 24,
  },
  favouritesHeadingCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  favouritesTitle: {
    fontSize: 21,
    lineHeight: 28,
  },
  favouritesSubtitle: {
    marginTop: 6,
    lineHeight: 20,
  },
  favouritesFilters: {
    marginBottom: 24,
  },
  favoritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 16,
    rowGap: 24,
  },
  favCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECEBE7',
    marginBottom: 4,
    paddingBottom: 0,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtnActive: {
    backgroundColor: '#FEF2F2',
  },
  favCardBody: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  favCardName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#111111',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  favCardSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 4,
  },
  favCardSub: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#6B7280',
  },
  favCardFooter: {
    minHeight: 46,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  favCardPrices: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  favPriceText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  favOldPriceText: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  favRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  starIcon: {
    color: '#B77912',
    fontSize: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },

  // ─── FULL SCREEN NAVIGATION MODAL ──────────────────
  fullScreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenHeader: {
    width: '100%',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 18,
    paddingRight: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  fullScreenClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  primaryNavList: {
    marginBottom: 0,
  },
  primaryNavRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  primaryNavText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  navRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  menuBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  editFeature: {
    marginTop: 10,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  editCopy: {
    flex: 1,
    minWidth: 0,
  },
  editEyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
    lineHeight: 21,
  },
  editLinkRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editLink: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  editImageFrame: {
    width: 76,
    height: 92,
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
    overflow: 'hidden',
  },
  editImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.3 }],
  },
  accountPanel: {
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
  },
  accountEyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  accountMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountAvatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  accountMemberCopy: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  accountMemberName: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  accountMemberEmail: {
    lineHeight: 16,
    fontSize: 11,
  },
  accountLogoutButton: {
    minHeight: 44,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  accountLogoutButtonActive: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  accountLogoutText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  guestAccountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guestSignInButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestSignInText: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  guestCreateButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  guestCreateButtonActive: {
    opacity: 0.85,
  },
  guestCreateText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
