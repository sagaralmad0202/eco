import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

const NEW_ARRIVALS = [
  { id: '1', name: 'Basic Tee', price: '$199.00', oldPrice: '$249.00', image: require('@/assets/images/p1.webp'), tag: 'New', colors: ['#7B4214', '#111'] },
  { id: '2', name: 'Basic Coahuila', price: '$99.00', image: require('@/assets/images/p2.webp'), colors: ['#111', '#6B4226'] },
  { id: '3', name: 'Nomad Tumbler', price: '$119.00', image: require('@/assets/images/p3.webp'), tag: 'Hot 🔥', colors: ['#fff', '#C0C0C0'] },
  { id: '5', name: 'Linen Blazer', price: '$95.00', image: require('@/assets/images/p5.webp'), colors: ['#F5DEB3', '#808080'] },
];

const FAVORITES = [
  { id: '4', name: 'Minimalist Watch', subtitle: 'Gold Silver', price: '$149.00', image: require('@/assets/images/p4.webp'), rating: '4.8', colors: ['#c4a35a', '#111'] },
  { id: '6', name: 'Velvet Skirt', subtitle: 'Wine Red', price: '$55.00', image: require('@/assets/images/p6.webp'), rating: '4.2', tag: 'New', colors: ['#722F37', '#191970'] },
];

const CATEGORIES = [
  { name: 'Women', emoji: '👗' },
  { name: 'Men', emoji: '👔' },
  { name: 'Accessories', emoji: '⌚' },
  { name: 'Footwear', emoji: '👟' },
  { name: 'Beauty', emoji: '💄' },
];

// Animated card component with spring press effect
function PressableCard({ children, style, onPress }: any) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        style={{ flex: 1 }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Fade-in section wrapper
function FadeInSection({ children, delay = 0, style }: any) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('Women');
  const [email, setEmail] = useState('');
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({ '6': true });
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';

  const toggleLike = (id: string) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
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
            <SymbolView
              name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }}
              size={22}
              tintColor={theme.text}
            />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
              size={20}
              tintColor={theme.text}
            />
            <Text style={[styles.logoText, { color: theme.text }]}>eco</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity accessibilityLabel="Open bag" onPress={() => router.push('/bag')} style={styles.headerIconBtn} activeOpacity={0.7}>
            <SymbolView
              name={{ ios: 'bag', android: 'shopping_bag', web: 'shopping_bag' }}
              size={22}
              tintColor={theme.text}
            />
            <View style={[styles.bagStatusDot, { borderColor: theme.backgroundElement }]} />
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel="Open profile" onPress={() => router.push('/profile')} style={styles.headerIconBtn} activeOpacity={0.7}>
            <SymbolView
              name={{ ios: 'person', android: 'person', web: 'person' }}
              size={22}
              tintColor={theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ backgroundColor: theme.backgroundElement }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <FadeInSection delay={0}>
          <PressableCard style={styles.heroBanner}>
            <View style={[styles.heroGradient, { backgroundColor: isLight ? '#F7F0EA' : '#2C2520' }]}>
              <View style={styles.heroTextContainer}>
                <View style={styles.heroEyebrowRow}>
                  <Text style={[styles.heroEyebrow, { color: theme.textSecondary }]}>In this season</Text>
                  <SymbolView
                    name={{ ios: 'flame.fill', android: 'local_fire_department', web: 'local_fire_department' }}
                    size={13}
                    tintColor="#f97316"
                  />
                </View>
                <Text style={[styles.heroTitle, { color: theme.text }]}>Sports equipment collection.</Text>
                <TouchableOpacity onPress={() => router.push('/shop')} style={[styles.heroBtn, { backgroundColor: theme.text }]} activeOpacity={0.8}>
                  <Text style={[styles.heroBtnText, { color: theme.backgroundElement }]}>Start shopping</Text>
                  <SymbolView
                    name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                    size={15}
                    tintColor={theme.backgroundElement}
                  />
                </TouchableOpacity>
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
                <View style={[styles.hiwStepBadge, { backgroundColor: item.bg }]}>
                  <Text style={[styles.hiwStepText, { color: item.color }]}>{item.step}</Text>
                </View>
                <Text style={[styles.hiwCardTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.hiwCardDesc, { color: theme.textSecondary }]}>{item.desc}</Text>
              </PressableCard>
            ))}
          </View>
        </FadeInSection>

        {/* New Arrivals */}
        <FadeInSection delay={400} style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>New Arrivals</Text>
              <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Our newest products</Text>
            </View>
            <TouchableOpacity style={[styles.seeAllBtn, { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
              <Text style={[styles.seeAllText, { color: theme.text }]}>See all</Text>
              <Text style={[styles.seeAllArrow, { color: theme.text }]}>→</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {NEW_ARRIVALS.map((item) => (
              <PressableCard key={item.id} style={[styles.miniCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                <View style={styles.miniCardImgWrap}>
                  <Image source={item.image} style={styles.miniCardImg} />
                  {item.tag && (
                    <View style={[styles.badge, item.tag.includes('🔥') ? styles.badgeHot : styles.badgeNew]}>
                      <Text style={[styles.badgeText, item.tag.includes('🔥') && styles.badgeHotText]}>{item.tag}</Text>
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
                  <View style={styles.priceRow}>
                    <Text style={[styles.miniCardPrice, { color: theme.text }]}>{item.price}</Text>
                    {item.oldPrice && <Text style={styles.miniCardOldPrice}>{item.oldPrice}</Text>}
                  </View>
                </View>
              </PressableCard>
            ))}
          </ScrollView>
        </FadeInSection>

        {/* Special Offer */}
        <FadeInSection delay={500}>
          <View style={[styles.specialContainer, { backgroundColor: isLight ? '#f0eef6' : '#232235' }]}>
            <View style={styles.specialAccent} />
            <View style={styles.specialContent}>
              <View style={styles.specialTagRow}>
                <Text style={styles.specialEmoji}>🎉</Text>
                <Text style={styles.specialTag}>Special Offer</Text>
              </View>
              <Text style={[styles.specialTitle, { color: theme.text }]}>Don't miss out on{'\n'}special offers</Text>
              <Text style={[styles.specialDesc, { color: theme.textSecondary }]}>Register to receive latest combos, discount codes and benefits.</Text>
              <View style={styles.specialInputRow}>
                <View style={[styles.specialInputWrap, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                  <Text style={styles.specialInputIcon}>✉️</Text>
                  <TextInput
                    style={[styles.specialInput, { color: theme.text }]}
                    placeholder="Your email address"
                    placeholderTextColor="#9ca3af"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
                <TouchableOpacity style={[styles.specialBtn, { backgroundColor: '#6366f1' }]} activeOpacity={0.8}>
                  <Text style={styles.specialBtnText}>Subscribe</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </FadeInSection>

        {/* Browse Categories */}
        <FadeInSection delay={600} style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 14, color: theme.text }]}>Browse Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.name}
                onPress={() => setActiveCategory(cat.name)}
                style={[
                  styles.catChip,
                  activeCategory === cat.name ? { backgroundColor: theme.text, borderColor: theme.text } : { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catChipText, activeCategory === cat.name ? { color: theme.backgroundElement } : { color: theme.textSecondary }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FadeInSection>

        {/* Find Your Favourite */}
        <FadeInSection delay={700} style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Find your Favourite</Text>
              <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Recommended for you</Text>
            </View>
            <TouchableOpacity style={[styles.seeAllBtn, { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
              <Text style={[styles.seeAllText, { color: theme.text }]}>See all</Text>
              <Text style={[styles.seeAllArrow, { color: theme.text }]}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.favoritesGrid}>
            {FAVORITES.map((item) => (
              <PressableCard key={item.id} style={[styles.favCard, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                <View style={styles.favCardImgWrap}>
                  <Image source={item.image} style={styles.favCardImg} />
                  {item.tag && (
                    <View style={styles.badgeNew}>
                      <Text style={styles.badgeText}>{item.tag}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={[styles.heartBtn, likedItems[item.id] && styles.heartBtnActive]}
                    onPress={() => toggleLike(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.heartText, likedItems[item.id] && styles.heartTextActive]}>
                      {likedItems[item.id] ? '❤️' : '🤍'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.favCardBody}>
                  {/* Color swatches */}
                  <View style={styles.colorSwatches}>
                    {item.colors.map((c, i) => (
                      <View key={i} style={[styles.colorDot, { backgroundColor: c }]} />
                    ))}
                  </View>
                  <Text style={[styles.favCardName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.favCardSub, { color: theme.textSecondary }]}>{item.subtitle}</Text>
                  <View style={styles.favCardFooter}>
                    <View style={styles.favPriceTag}>
                      <Text style={styles.favPriceText}>{item.price}</Text>
                    </View>
                    <View style={styles.favRating}>
                      <Text style={styles.starIcon}>★</Text>
                      <Text style={styles.ratingText}>{item.rating}</Text>
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 4,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
    backgroundColor: '#ffffff',
  },
  headerBtn: {
    width: 48,
    height: 48,
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
    marginLeft: 4,
  },
  logoCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#111827',
    marginRight: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCheck: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerIcon: {
    fontSize: 18,
  },
  bagStatusDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  bagIcon: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#111827',
    borderRadius: 3,
    marginTop: 4,
  },
  bagHandle: {
    position: 'absolute',
    top: -5,
    left: 3,
    right: 3,
    height: 5,
    borderWidth: 2,
    borderColor: '#111827',
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
  profileBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },

  // ─── Scroll ────────────────────────────────────────
  scrollContent: {
    paddingBottom: 40,
  },

  // ─── Search ────────────────────────────────────────
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
  },
  searchFilterBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchFilterIcon: {
    fontSize: 14,
  },

  // ─── Hero ──────────────────────────────────────────
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
  heroEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    width: 160,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 25,
    marginBottom: 14,
  },
  heroBtn: {
    height: 40,
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    borderRadius: 99,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  heroBtnArrow: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  heroImg: {
    position: 'absolute',
    right: -12,
    bottom: 0,
    width: 170,
    height: 176,
    zIndex: 1,
  },

  // ─── Flash Sale ────────────────────────────────────
  flashSaleContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flashSaleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flashDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  flashLabel: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  flashTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timerBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timerNum: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  timerColon: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '700',
  },
  flashShopBtn: {
    color: '#facc15',
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Sections ──────────────────────────────────────
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionSub: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
    fontWeight: '400',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
  },
  seeAllArrow: {
    fontSize: 12,
    color: '#4b5563',
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
    borderColor: '#f0f0f2',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 1,
  },
  hiwImgWrap: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  hiwImg: {
    width: '100%',
    height: '100%',
  },
  hiwStepBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  hiwStepText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  hiwCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  hiwCardDesc: {
    fontSize: 11,
    color: '#9ca3af',
    lineHeight: 16,
    textAlign: 'center',
  },

  // ─── New Arrivals Cards ────────────────────────────
  horizontalScroll: {
    paddingRight: 20,
  },
  miniCard: {
    width: 148,
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f2',
  },
  miniCardImgWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#f9fafb',
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
    borderColor: 'rgba(0,0,0,0.08)',
  },
  colorDotWhite: {
    borderColor: 'rgba(0,0,0,0.15)',
  },
  miniCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniCardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  miniCardOldPrice: {
    fontSize: 11,
    color: '#d1d5db',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },

  // ─── Badges ────────────────────────────────────────
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  badgeHot: {
    backgroundColor: '#fef2f2',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeHotText: {
    color: '#ef4444',
  },

  // ─── Special Offer ─────────────────────────────────
  specialContainer: {
    marginHorizontal: 20,
    marginTop: 28,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#f0eef6',
    flexDirection: 'row',
  },
  specialAccent: {
    width: 5,
    backgroundColor: '#6366f1',
  },
  specialContent: {
    flex: 1,
    padding: 22,
  },
  specialTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  specialEmoji: {
    fontSize: 14,
  },
  specialTag: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#6366f1',
    letterSpacing: 1,
  },
  specialTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  specialDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  specialInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  specialInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 99,
    paddingHorizontal: 14,
    height: 42,
  },
  specialInputIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  specialInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  specialBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 99,
    paddingHorizontal: 18,
    justifyContent: 'center',
    height: 42,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  specialBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Categories ────────────────────────────────────
  categoryScroll: {
    paddingRight: 20,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 99,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  catEmoji: {
    fontSize: 14,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // ─── Favourites ────────────────────────────────────
  favoritesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  favCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f2',
  },
  favCardImgWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f9fafb',
  },
  favCardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heartBtnActive: {
    backgroundColor: '#fef2f2',
  },
  heartText: {
    fontSize: 14,
  },
  heartTextActive: {
    fontSize: 14,
  },
  favCardBody: {
    padding: 14,
  },
  favCardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  favCardSub: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 8,
  },
  favCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favPriceTag: {
    borderWidth: 1.5,
    borderColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: '#f0fdf4',
  },
  favPriceText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
  },
  favRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fffbeb',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  starIcon: {
    color: '#facc15',
    fontSize: 12,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
});
