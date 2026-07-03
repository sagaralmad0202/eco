import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

const { width } = Dimensions.get('window');

const NEW_ARRIVALS = [
  { id: '1', name: 'Basic Tee', price: '$199.00', image: require('@/assets/images/p1.webp'), tag: 'New' },
  { id: '2', name: 'Basic Coahuila', price: '$99.00', image: require('@/assets/images/p2.webp') },
  { id: '3', name: 'Nomad Tumbler', price: '$119.00', image: require('@/assets/images/p3.webp') },
  { id: '5', name: 'Linen Blazer', price: '$95.00', image: require('@/assets/images/p5.webp') },
];

const FAVORITES = [
  { id: '4', name: 'Minimalist Watch', price: '$149.00', image: require('@/assets/images/p4.webp'), rating: '4.5' },
  { id: '6', name: 'Velvet Skirt', price: '$55.00', image: require('@/assets/images/p6.webp'), rating: '4.2', tag: 'New' },
];

const CATEGORIES = ['Women', 'Men', 'Accessories', 'Footwear', 'Beauty'];

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('Women');
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn}>
          {/* Menu icon */}
          <View style={styles.menuIconLine} />
          <View style={[styles.menuIconLine, { width: 14, marginTop: 4 }]} />
          <View style={[styles.menuIconLine, { width: 18, marginTop: 4 }]} />
        </TouchableOpacity>

        {/* ECO Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle} />
          <Text style={styles.logoText}>eco</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            {/* Bag icon */}
            <View style={styles.bagIcon}>
              <View style={styles.bagHandle} />
              <View style={styles.bagDot} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn}>
            <Image source={require('@/assets/images/avatar1.webp')} style={styles.profileAvatar} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Hero Banner */}
        <TouchableOpacity activeOpacity={0.9} style={styles.heroBanner}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroEyebrow}>In this season 🔥</Text>
            <Text style={styles.heroTitle}>Sports equipment collection.</Text>
            <View style={styles.heroBtn}>
              <Text style={styles.heroBtnText}>Start shopping →</Text>
            </View>
          </View>
          <Image source={require('@/assets/images/hero-right-4.webp')} style={styles.heroImg} resizeMode="contain" />
        </TouchableOpacity>

        {/* How It Works */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>How it Works</Text>
            <Text style={styles.sectionSub}>Find the most suitable items</Text>
          </View>
          
          <View style={styles.hiwGrid}>
            {/* Step 1 */}
            <View style={styles.hiwCard}>
              <View style={styles.hiwImgWrap}>
                <Image source={require('@/assets/images/HIW1img.webp')} style={styles.hiwImg} resizeMode="contain" />
              </View>
              <View style={[styles.hiwStepBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={[styles.hiwStepText, { color: '#ef4444' }]}>Step 1</Text>
              </View>
              <Text style={styles.hiwCardTitle}>Filter & Discover</Text>
              <Text style={styles.hiwCardDesc}>Smart filtering and suggestions make it easy to find</Text>
            </View>

            {/* Step 2 */}
            <View style={styles.hiwCard}>
              <View style={styles.hiwImgWrap}>
                <Image source={require('@/assets/images/HIW2img.webp')} style={styles.hiwImg} resizeMode="contain" />
              </View>
              <View style={[styles.hiwStepBadge, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Text style={[styles.hiwStepText, { color: '#6366f1' }]}>Step 2</Text>
              </View>
              <Text style={styles.hiwCardTitle}>Add to bag</Text>
              <Text style={styles.hiwCardDesc}>Easily select the correct items and add them to the cart</Text>
            </View>

            {/* Step 3 */}
            <View style={styles.hiwCard}>
              <View style={styles.hiwImgWrap}>
                <Image source={require('@/assets/images/HIW3img.webp')} style={styles.hiwImg} resizeMode="contain" />
              </View>
              <View style={[styles.hiwStepBadge, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Text style={[styles.hiwStepText, { color: '#d97706' }]}>Step 3</Text>
              </View>
              <Text style={styles.hiwCardTitle}>Fast shipping</Text>
              <Text style={styles.hiwCardDesc}>The carrier will confirm and ship quickly to you</Text>
            </View>

            {/* Step 4 */}
            <View style={styles.hiwCard}>
              <View style={styles.hiwImgWrap}>
                <Image source={require('@/assets/images/HIW4img.webp')} style={styles.hiwImg} resizeMode="contain" />
              </View>
              <View style={[styles.hiwStepBadge, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                <Text style={[styles.hiwStepText, { color: '#a855f7' }]}>Step 4</Text>
              </View>
              <Text style={styles.hiwCardTitle}>Enjoy the product</Text>
              <Text style={styles.hiwCardDesc}>Have fun and enjoy your 5-star quality products</Text>
            </View>
          </View>
        </View>

        {/* New Arrivals */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <Text style={styles.sectionSub}>Our newest products</Text>
            </View>
            <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {NEW_ARRIVALS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.miniCard} activeOpacity={0.9}>
                <View style={styles.miniCardImgWrap}>
                  <Image source={item.image} style={styles.miniCardImg} />
                  {item.tag && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>{item.tag}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.miniCardBody}>
                  <Text style={styles.miniCardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.miniCardPrice}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Special Offer */}
        <View style={styles.specialContainer}>
          <Text style={styles.specialTag}>Special Offer</Text>
          <Text style={styles.specialTitle}>Don't miss out on special offers</Text>
          <Text style={styles.specialDesc}>Register to receive latest combos, discount codes and benefits.</Text>
          <View style={styles.specialInputRow}>
            <TextInput
              style={styles.specialInput}
              placeholder="Your email address"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity style={styles.specialBtn}>
              <Text style={styles.specialBtnText}>Subscribe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Browse Categories */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Browse Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
              >
                <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Find Your Favourite */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Find your Favourite</Text>
              <Text style={styles.sectionSub}>Recommended for you</Text>
            </View>
            <TouchableOpacity><Text style={styles.seeAllText}>See all</Text></TouchableOpacity>
          </View>
          
          <View style={styles.favoritesGrid}>
            {FAVORITES.map((item) => (
              <TouchableOpacity key={item.id} style={styles.favCard} activeOpacity={0.9}>
                <View style={styles.favCardImgWrap}>
                  <Image source={item.image} style={styles.favCardImg} />
                  {item.tag && (
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>{item.tag}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.heartBtn}>
                    <Text style={styles.heartText}>♡</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.favCardBody}>
                  <Text style={styles.favCardName}>{item.name}</Text>
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
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconLine: {
    height: 2,
    width: 20,
    backgroundColor: '#111827',
    borderRadius: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -40 }],
  },
  logoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#111827',
    marginRight: 6,
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
    gap: 8,
  },
  bagIcon: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#111827',
    borderRadius: 4,
    marginTop: 4,
  },
  bagHandle: {
    position: 'absolute',
    top: -5,
    left: 4,
    right: 4,
    height: 5,
    borderWidth: 2,
    borderColor: '#111827',
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  bagDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#22c55e',
  },
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#F7F0EA',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    flexDirection: 'row',
    minHeight: 180,
    overflow: 'hidden',
  },
  heroTextContainer: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 26,
    marginBottom: 16,
    maxWidth: 160,
  },
  heroBtn: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 99,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  heroImg: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 150,
    height: 160,
    zIndex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  hiwGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hiwCard: {
    width: (width - 44) / 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 1,
  },
  hiwImgWrap: {
    width: 80,
    height: 80,
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
    fontSize: 9,
    fontWeight: '700',
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
    color: '#6b7280',
    lineHeight: 15,
    textAlign: 'center',
  },
  horizontalScroll: {
    paddingRight: 16,
  },
  miniCard: {
    width: 130,
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    overflow: 'hidden',
  },
  miniCardImgWrap: {
    width: '100%',
    aspectRatio: 3/4,
    backgroundColor: '#f9fafb',
  },
  miniCardImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  miniCardBody: {
    padding: 8,
  },
  miniCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  miniCardPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  newBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#111827',
  },
  specialContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  specialTag: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#6b7280',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  specialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
    maxWidth: 200,
  },
  specialDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 16,
  },
  specialInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  specialInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 99,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#111827',
  },
  specialBtn: {
    backgroundColor: '#111827',
    borderRadius: 99,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  specialBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingRight: 16,
  },
  catChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  catChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  favoritesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  favCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 20,
    overflow: 'hidden',
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
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  heartText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  favCardBody: {
    padding: 12,
  },
  favCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  favCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favPriceTag: {
    borderWidth: 1.5,
    borderColor: '#22c55e',
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  favPriceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#22c55e',
  },
  favRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    color: '#facc15',
    fontSize: 12,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
});
