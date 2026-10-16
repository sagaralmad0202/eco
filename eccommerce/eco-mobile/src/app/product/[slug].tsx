import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Toast } from '@ant-design/react-native';

import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import {
  productsApi,
  BackendProduct,
  ProductVariant,
  COLOUR_HEX,
  PRODUCT_METADATA_MAP,
} from '@/services/products-api';
import { wishlistApi } from '@/services/wishlist-api';

import ProductGallery from '@/components/product/ProductGallery';
import PolicyCards from '@/components/product/PolicyCards';
import SizeChartModal from '@/components/product/SizeChartModal';
import ProductAccordion from '@/components/product/ProductAccordion';
import ReviewsSection from '@/components/product/ReviewsSection';
import RelatedProducts from '@/components/product/RelatedProducts';
import ProductDetailsSkeleton from '@/components/product/ProductDetailsSkeleton';

const { width } = Dimensions.get('window');

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];
const DEFAULT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Brown', value: '#7B4214' },
  { name: 'Beige', value: '#D1C9C1' },
  { name: 'Blush Peach', value: '#f7e3d4' },
];

const HEX_TO_NAME: Record<string, string> = {
  '#000000': 'Black',
  '#111111': 'Onyx Black',
  '#7b4214': 'Warm Brown',
  '#c6bdb5': 'Oatmeal',
  '#f2d8cb': 'Blush Peach',
  '#d1c9c1': 'Beige',
  '#f7e3d4': 'Soft Peach',
  '#3b9668': 'Emerald Green',
  '#9ed414': 'Lime Green',
  '#060a82': 'Deep Navy',
  '#ff7e47': 'Coral Orange',
  '#add8e6': 'Light Blue',
  '#00008b': 'Indigo Blue',
  '#3b474e': 'Slate Grey',
  '#fc9faf': 'Pastel Rose',
  '#811428': 'Burgundy',
  '#f5f5dc': 'Natural Beige',
  '#000080': 'Classic Navy',
  '#808000': 'Olive',
  '#722f37': 'Wine Red',
  '#191970': 'Midnight',
  '#50c878': 'Forest Green',
  '#d4af37': 'Rich Gold',
  '#a0522d': 'Sienna',
  '#808080': 'Heather Grey',
  '#c19a6b': 'Camel Tan',
  '#1e40af': 'Royal Blue',
  '#4b0082': 'Deep Purple',
  '#ffffff': 'Pure White',
  '#ffb6c1': 'Soft Pink',
  '#87ceeb': 'Sky Blue',
  '#ec4899': 'Blossom Pink',
  '#166534': 'Dark Olive',
  '#7c4a2d': 'Cognac Brown',
};

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const { addToCart, cartCount } = useCart();
  const scrollRef = useRef<ScrollView>(null);
  const reviewsSectionY = useRef<number>(0);

  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!slug) return;
    try {
      setLoading(true);
      setError(null);
      const res = await productsApi.getBySlug(slug);
      if (res?.data) {
        setProduct(res.data);
      } else {
        setError('Product not found');
      }
    } catch (err: any) {
      console.warn('Failed to load product from API:', err);
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const variants = useMemo(() => {
    return Array.isArray(product?.variants) ? product.variants : [];
  }, [product?.variants]);

  // Extract available sizes from variants or default
  const availableSizes = useMemo(() => {
    if (variants.length > 0) {
      const extracted = variants.map((v) => {
        const parts = String(v.title ?? '').split('/');
        return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
      });
      const unique = Array.from(new Set(extracted)).filter(Boolean);
      if (unique.length > 0) return unique;
    }
    return DEFAULT_SIZES;
  }, [variants]);

  // Extract available colors from metadata or variants
  const availableColors = useMemo(() => {
    const slugKey = product?.slug || '';
    const meta = PRODUCT_METADATA_MAP[slugKey];
    if (meta?.colors && meta.colors.length > 0) {
      return meta.colors.map((hex) => {
        const lower = hex.toLowerCase();
        const name = HEX_TO_NAME[lower] || meta.subtitle || 'Color Option';
        return {
          name,
          value: hex,
        };
      });
    }

    if (variants.length > 0) {
      const colorsMap = new Map<string, string>();
      variants.forEach((v) => {
        const parts = String(v.title ?? '').split('/');
        const colorName = parts[0].trim().toLowerCase();
        const hex = COLOUR_HEX[colorName];
        if (hex) {
          const lower = hex.toLowerCase();
          const name = HEX_TO_NAME[lower] || parts[0].trim();
          colorsMap.set(hex, name);
        }
      });
      if (colorsMap.size > 0) {
        return Array.from(colorsMap.entries()).map(([value, name]) => ({
          name,
          value,
        }));
      }
    }

    return DEFAULT_COLORS;
  }, [product?.slug, variants]);

  // Determine current active variant based on selected size / color
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (variants.length === 0) return null;

    const sizeName = availableSizes[selectedSize] || 'M';
    const wantedSize = sizeName.toLowerCase();

    // Match variant by size
    const match = variants.find((v) => {
      const parts = String(v.title ?? '').split('/');
      const s = parts[parts.length - 1].trim().toLowerCase();
      return s === wantedSize;
    });

    if (match) return match;

    // Fallback: cheapest in-stock variant
    const inStockList = variants.filter((v) => v.stock > 0);
    return inStockList.length > 0 ? inStockList[0] : variants[0];
  }, [variants, availableSizes, selectedSize]);

  // Determine price & compare price
  const displayPrice = useMemo(() => {
    if (selectedVariant?.price) {
      const num = parseFloat(selectedVariant.price);
      return isNaN(num) ? selectedVariant.price : `$${num.toFixed(2)}`;
    }
    const raw = product?.priceFrom || product?.price || '85.00';
    const num = parseFloat(raw);
    return isNaN(num) ? `$${raw}` : `$${num.toFixed(2)}`;
  }, [selectedVariant, product]);

  const displayComparePrice = useMemo(() => {
    const raw = selectedVariant?.compareAtPrice || product?.compareAtPrice;
    if (raw) {
      const num = parseFloat(raw);
      return isNaN(num) ? `$${raw}` : `$${num.toFixed(2)}`;
    }
    return null;
  }, [selectedVariant, product]);

  const discountPercent = useMemo(() => {
    if (!displayComparePrice || !displayPrice) return null;
    const numCurrent = parseFloat(displayPrice.replace(/[^0-9.]/g, ''));
    const numOld = parseFloat(displayComparePrice.replace(/[^0-9.]/g, ''));
    if (numOld > numCurrent && numCurrent > 0) {
      const pct = Math.round(((numOld - numCurrent) / numOld) * 100);
      return pct > 0 ? `${pct}% OFF` : null;
    }
    return null;
  }, [displayPrice, displayComparePrice]);

  const stockStatus = useMemo(() => {
    const stock = selectedVariant?.stock;
    if (typeof stock === 'number') {
      if (stock <= 0) return { label: 'Out of Stock', type: 'out', color: '#EF4444' };
      if (stock <= 5) return { label: `Only ${stock} left`, type: 'low', color: '#F59E0B' };
      return { label: 'In Stock', type: 'in', color: '#16A34A' };
    }
    if (product?.inStock === false) {
      return { label: 'Out of Stock', type: 'out', color: '#EF4444' };
    }
    return { label: 'In Stock', type: 'in', color: '#16A34A' };
  }, [selectedVariant, product]);

  const stockLimit = useMemo(() => {
    if (typeof selectedVariant?.stock === 'number' && selectedVariant.stock > 0) {
      return Math.min(10, selectedVariant.stock);
    }
    return 10;
  }, [selectedVariant]);

  // Extract gallery images
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(product?.images) && product.images.length > 0) {
      product.images.forEach((img) => {
        const u = typeof img === 'string' ? img : img?.url;
        if (u) list.push(u);
      });
    }
    if (list.length === 0 && product?.image) {
      list.push(product.image);
    }
    return list;
  }, [product]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      Toast.info('Please log in to add items to your wishlist', 2);
      router.push('/login');
      return;
    }
    if (!product?.id) return;
    try {
      const res = await wishlistApi.toggle(product.id);
      setIsLiked(res.action === 'added');
      Toast.success(res.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist', 1.5);
    } catch (e: any) {
      console.warn('Wishlist toggle error:', e);
      Toast.fail('Could not update wishlist', 1.5);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      Toast.fail('No available variant selected', 1.5);
      return;
    }
    if (stockStatus.type === 'out') {
      Toast.fail('This item is currently out of stock', 1.5);
      return;
    }
    try {
      setIsAdding(true);
      const res = await addToCart(selectedVariant.id, quantity);
      if (res.success) {
        Toast.success('Added to your bag!', 1.5);
      } else {
        Toast.fail(res.error || 'Could not add to bag', 2);
      }
    } catch (err: any) {
      Toast.fail('Error adding to bag', 1.5);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant?.id) {
      Toast.fail('No available variant selected', 1.5);
      return;
    }
    if (stockStatus.type === 'out') {
      Toast.fail('This item is currently out of stock', 1.5);
      return;
    }
    try {
      setIsAdding(true);
      const res = await addToCart(selectedVariant.id, quantity);
      if (res.success) {
        router.push('/bag');
      } else {
        Toast.fail(res.error || 'Could not add to bag', 2);
      }
    } catch (err: any) {
      Toast.fail('Error processing request', 1.5);
    } finally {
      setIsAdding(false);
    }
  };

  const categoryName =
    typeof product?.category === 'object' && product?.category?.name
      ? product.category.name
      : typeof product?.category === 'string'
      ? product.category
      : 'General';

  const ratingVal =
    typeof product?.rating === 'object' && product?.rating?.average
      ? product.rating.average.toFixed(1)
      : '4.5';

  const reviewsCount =
    typeof product?.rating === 'object' && product?.rating?.count
      ? product.rating.count
      : (product?.reviews?.length || 2);

  const meta = product?.slug ? PRODUCT_METADATA_MAP[product.slug] : null;
  const badgeTag = meta?.badge ?? (product?.isFeatured ? 'New in' : null);

  const showSizes =
    categoryName !== 'Beauty' &&
    categoryName !== 'Fragrance' &&
    availableSizes.length > 0 &&
    !(availableSizes.length === 1 && (availableSizes[0] === 'One Size' || availableSizes[0].includes('100ml')));

  const scrollToReviews = () => {
    if (reviewsSectionY.current > 0) {
      scrollRef.current?.scrollTo({ y: reviewsSectionY.current - 40, animated: true });
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.backgroundElement }]}>
      <StatusBar
        barStyle={isLight ? 'dark-content' : 'light-content'}
        backgroundColor={theme.backgroundElement}
      />

      {/* Top Header Bar */}
      <View
        style={[
          styles.topNav,
          {
            backgroundColor: theme.backgroundElement,
            borderBottomColor: isLight ? '#EAE8E3' : '#2D2D30',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.navBtn, { backgroundColor: isLight ? '#F4F4F5' : '#252528' }]}
          hitSlop={8}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: theme.text }]} numberOfLines={1}>
          {product?.name || 'Product Details'}
        </Text>

        <View style={styles.navRight}>
          <TouchableOpacity
            onPress={handleToggleWishlist}
            style={[styles.navBtn, { backgroundColor: isLight ? '#F4F4F5' : '#252528' }]}
            hitSlop={8}
            accessibilityLabel="Toggle Wishlist"
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#EF4444' : theme.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/bag')}
            style={[styles.navBtn, { backgroundColor: isLight ? '#F4F4F5' : '#252528' }]}
            hitSlop={8}
            accessibilityLabel="View Shopping Bag"
          >
            <Ionicons name="bag-handle-outline" size={20} color={theme.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            backgroundColor: theme.background,
            paddingBottom: 24,
          },
        ]}
      >
        {loading && !product ? (
          <ProductDetailsSkeleton />
        ) : error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <Text style={[styles.errorTitle, { color: theme.text }]}>Product Not Found</Text>
            <Text style={[styles.errorSub, { color: theme.textSecondary }]}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/shop')}
              style={[styles.browseBtn, { backgroundColor: theme.text }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.browseBtnText, { color: theme.backgroundElement }]}>
                Browse Catalog
              </Text>
            </TouchableOpacity>
          </View>
        ) : product ? (
          <View style={styles.productBody}>
            {/* Gallery */}
            <ProductGallery
              images={galleryImages}
              productName={product.name}
              tag={badgeTag}
              isLiked={isLiked}
            />

            {/* Product Meta & Information Section */}
            <View style={styles.sectionPadding}>
              {/* Breadcrumb & Category Bar */}
              <View style={styles.metaRow}>
                <View style={styles.breadcrumbWrap}>
                  <TouchableOpacity onPress={() => router.push('/')} hitSlop={6}>
                    <Text style={[styles.breadcrumbText, { color: theme.textSecondary }]}>Home</Text>
                  </TouchableOpacity>
                  <Ionicons name="chevron-forward" size={12} color={theme.textSecondary} />
                  <TouchableOpacity onPress={() => router.push('/shop')} hitSlop={6}>
                    <Text style={[styles.breadcrumbText, { color: theme.textSecondary }]}>
                      {categoryName}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.categoryPill, { backgroundColor: isLight ? '#F0EFEA' : '#252528' }]}>
                  <Text style={[styles.categoryPillText, { color: theme.textSecondary }]}>
                    {categoryName.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Product Title */}
              <Text style={[styles.productName, { color: theme.text }]} accessibilityRole="header">
                {product.name}
              </Text>

              {/* Rating & Review summary snippet */}
              <TouchableOpacity
                style={styles.ratingSnippetRow}
                onPress={scrollToReviews}
                activeOpacity={0.7}
                accessibilityLabel={`Rated ${ratingVal} out of 5 stars based on ${reviewsCount} reviews`}
              >
                <View style={styles.ratingStars}>
                  <Ionicons name="star" size={15} color="#F59E0B" />
                  <Text style={[styles.ratingScore, { color: theme.text }]}>
                    {ratingVal}
                  </Text>
                </View>
                <Text style={[styles.dotSep, { color: theme.textSecondary }]}>·</Text>
                <Text style={[styles.reviewCountLink, { color: theme.textSecondary }]}>
                  {reviewsCount} {reviewsCount === 1 ? 'verified review' : 'verified reviews'}
                </Text>
              </TouchableOpacity>

              {/* Pricing & Stock Hero Bar */}
              <View style={styles.pricingHeroRow}>
                <View style={styles.priceGroup}>
                  <Text style={[styles.mainPriceText, { color: theme.text }]}>
                    {displayPrice}
                  </Text>
                  {displayComparePrice && (
                    <Text style={[styles.comparePriceText, { color: theme.textSecondary }]}>
                      {displayComparePrice}
                    </Text>
                  )}
                  {discountPercent && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>{discountPercent}</Text>
                    </View>
                  )}
                </View>

                {/* Stock status indicator */}
                <View
                  style={[
                    styles.stockPill,
                    {
                      backgroundColor:
                        stockStatus.type === 'in'
                          ? isLight
                            ? '#F0FDF4'
                            : '#14291C'
                          : stockStatus.type === 'low'
                          ? isLight
                            ? '#FFFBEB'
                            : '#2A2012'
                          : isLight
                          ? '#FEF2F2'
                          : '#2A1818',
                      borderColor:
                        stockStatus.type === 'in'
                          ? '#BBF7D0'
                          : stockStatus.type === 'low'
                          ? '#FDE68A'
                          : '#FECACA',
                    },
                  ]}
                >
                  <View style={[styles.stockDot, { backgroundColor: stockStatus.color }]} />
                  <Text style={[styles.stockLabel, { color: stockStatus.color }]}>
                    {stockStatus.label}
                  </Text>
                </View>
              </View>

              {/* Variants Section */}
              <View style={styles.variantsContainer}>
                {/* Colors */}
                {availableColors.length > 0 && (
                  <View style={styles.optionSection}>
                    <View style={styles.optionHeaderRow}>
                      <Text style={[styles.optionLabel, { color: theme.text }]}>
                        Color:{' '}
                        <Text style={[styles.optionValueText, { color: theme.textSecondary }]}>
                          {availableColors[selectedColor]?.name}
                        </Text>
                      </Text>
                    </View>
                    <View style={styles.swatchesRow}>
                      {availableColors.map((color, idx) => {
                        const isSelected = selectedColor === idx;
                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => setSelectedColor(idx)}
                            activeOpacity={0.8}
                            accessibilityLabel={`Select color ${color.name}`}
                            style={[
                              styles.swatchOuterRing,
                              {
                                borderColor: isSelected ? theme.text : 'transparent',
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.swatchInnerCircle,
                                { backgroundColor: color.value },
                                color.value.toLowerCase() === '#ffffff' && styles.whiteSwatchBorder,
                              ]}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Sizes */}
                {showSizes && (
                  <View style={styles.optionSection}>
                    <View style={styles.optionHeaderRow}>
                      <Text style={[styles.optionLabel, { color: theme.text }]}>
                        Size:{' '}
                        <Text style={[styles.optionValueText, { color: theme.textSecondary }]}>
                          {availableSizes[selectedSize]}
                        </Text>
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSizeChartOpen(true)}
                        hitSlop={6}
                        style={styles.sizeGuideBtn}
                        accessibilityLabel="Open Size Guide"
                      >
                        <Ionicons name="resize-outline" size={14} color={theme.textSecondary} />
                        <Text style={[styles.sizeGuideText, { color: theme.textSecondary }]}>
                          Size Guide
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.sizeGrid}>
                      {availableSizes.map((size, idx) => {
                        const isSelected = selectedSize === idx;
                        return (
                          <TouchableOpacity
                            key={size}
                            onPress={() => setSelectedSize(idx)}
                            activeOpacity={0.75}
                            accessibilityLabel={`Size ${size}`}
                            style={[
                              styles.sizeCard,
                              isSelected
                                ? { backgroundColor: theme.text, borderColor: theme.text }
                                : {
                                    backgroundColor: isLight ? '#FFFFFF' : '#1C1C1E',
                                    borderColor: isLight ? '#EAE8E3' : '#2D2D30',
                                  },
                            ]}
                          >
                            <Text
                              style={[
                                styles.sizeCardText,
                                {
                                  color: isSelected ? theme.backgroundElement : theme.text,
                                  fontWeight: isSelected ? '700' : '600',
                                },
                              ]}
                            >
                              {size}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>

              {/* Purchase Controls */}
              <View style={styles.purchaseSection}>
                <View style={styles.actionRow}>
                  {/* Stepper */}
                  <View
                    style={[
                      styles.stepperContainer,
                      {
                        backgroundColor: isLight ? '#FFFFFF' : '#1C1C1E',
                        borderColor: isLight ? '#EAE8E3' : '#2D2D30',
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={styles.stepperActionBtn}
                      disabled={quantity <= 1 || stockStatus.type === 'out'}
                      hitSlop={6}
                      accessibilityLabel="Decrease quantity"
                    >
                      <Ionicons
                        name="remove"
                        size={16}
                        color={quantity <= 1 || stockStatus.type === 'out' ? '#9CA3AF' : theme.text}
                      />
                    </TouchableOpacity>

                    <Text style={[styles.stepperCountText, { color: theme.text }]}>
                      {quantity}
                    </Text>

                    <TouchableOpacity
                      onPress={() => setQuantity((q) => Math.min(stockLimit, q + 1))}
                      style={styles.stepperActionBtn}
                      disabled={quantity >= stockLimit || stockStatus.type === 'out'}
                      hitSlop={6}
                      accessibilityLabel="Increase quantity"
                    >
                      <Ionicons
                        name="add"
                        size={16}
                        color={quantity >= stockLimit || stockStatus.type === 'out' ? '#9CA3AF' : theme.text}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Primary Add to Bag Button */}
                  <TouchableOpacity
                    style={[
                      styles.primaryAddBtn,
                      {
                        backgroundColor: stockStatus.type === 'out' ? '#9CA3AF' : theme.text,
                      },
                    ]}
                    onPress={handleAddToCart}
                    disabled={isAdding || stockStatus.type === 'out'}
                    activeOpacity={0.88}
                  >
                    {isAdding ? (
                      <ActivityIndicator size="small" color={theme.backgroundElement} />
                    ) : (
                      <>
                        <Ionicons name="bag-handle-outline" size={18} color={theme.backgroundElement} />
                        <Text style={[styles.primaryAddBtnText, { color: theme.backgroundElement }]}>
                          {stockStatus.type === 'out' ? 'Sold Out' : 'Add to Bag'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Buy Now Button */}
                {stockStatus.type !== 'out' && (
                  <TouchableOpacity
                    style={[
                      styles.secondaryBuyBtn,
                      {
                        backgroundColor: isLight ? '#FFFFFF' : '#1C1C1E',
                        borderColor: isLight ? '#222' : '#EAE8E3',
                      },
                    ]}
                    onPress={handleBuyNow}
                    disabled={isAdding}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.secondaryBuyBtnText, { color: theme.text }]}>
                      Buy Now
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Micro Trust Line */}
                <View style={styles.microTrustRow}>
                  <Ionicons name="shield-checkmark" size={14} color="#16A34A" />
                  <Text style={[styles.microTrustText, { color: theme.textSecondary }]}>
                    Guaranteed safe & secure checkout • Fast dispatch
                  </Text>
                </View>
              </View>

              {/* Policy Trust Panel */}
              <PolicyCards />

              {/* Product Overview & Specification Card */}
              <View style={styles.detailsCard}>
                <Text style={[styles.detailsSectionHeading, { color: theme.text }]}>
                  Overview & Details
                </Text>
                <Text style={[styles.detailsBodyText, { color: theme.textSecondary }]}>
                  {product.description ||
                    'Thoughtfully designed with premium materials for everyday durability and elegance. Precision craftsmanship and clean lines provide timeless style.'}
                </Text>

                {/* Specs Table */}
                <View
                  style={[
                    styles.specsTable,
                    {
                      backgroundColor: isLight ? '#FAF9F6' : '#1A1A1C',
                      borderColor: isLight ? '#EAE8E3' : '#2D2D30',
                    },
                  ]}
                >
                  <View style={styles.specRow}>
                    <Text style={[styles.specKey, { color: theme.textSecondary }]}>Brand</Text>
                    <Text style={[styles.specValue, { color: theme.text }]}>
                      {product.brand || 'Eco Studio'}
                    </Text>
                  </View>
                  <View style={[styles.specDivider, { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]} />
                  <View style={styles.specRow}>
                    <Text style={[styles.specKey, { color: theme.textSecondary }]}>Category</Text>
                    <Text style={[styles.specValue, { color: theme.text }]}>{categoryName}</Text>
                  </View>
                  <View style={[styles.specDivider, { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]} />
                  <View style={styles.specRow}>
                    <Text style={[styles.specKey, { color: theme.textSecondary }]}>Reference / SKU</Text>
                    <Text style={[styles.specValue, { color: theme.text }]}>
                      {selectedVariant?.sku || product.slug?.toUpperCase() || 'ECO-ITEM'}
                    </Text>
                  </View>
                  <View style={[styles.specDivider, { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]} />
                  <View style={styles.specRow}>
                    <Text style={[styles.specKey, { color: theme.textSecondary }]}>Inventory Status</Text>
                    <Text style={[styles.specValue, { color: stockStatus.color, fontWeight: '700' }]}>
                      {stockStatus.label}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Supporting Product Accordions */}
              <ProductAccordion category={categoryName} />

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]} />

              {/* Customer Reviews Section */}
              <View
                onLayout={(e) => {
                  reviewsSectionY.current = e.nativeEvent.layout.y;
                }}
              >
                <ReviewsSection
                  productId={product.id || product.slug}
                  onSummaryUpdate={() => {}}
                />
              </View>

              {/* Divider */}
              <View style={[styles.divider, { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]} />

              {/* Related Products Carousel */}
              <RelatedProducts
                currentProductId={product.id}
                currentProductSlug={product.slug}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Sizing Chart Modal */}
      <SizeChartModal
        isOpen={sizeChartOpen}
        onClose={() => setSizeChartOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topNav: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  navTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  navRight: {
    flexDirection: 'row',
    gap: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  productBody: {
    paddingTop: 0,
  },
  sectionPadding: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  // Meta row & Breadcrumbs
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breadcrumbWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Title
  productName: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8,
  },

  // Ratings
  ratingSnippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '700',
  },
  dotSep: {
    fontSize: 13,
  },
  reviewCountLink: {
    fontSize: 13,
    textDecorationLine: 'underline',
  },

  // Pricing hero line
  pricingHeroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainPriceText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  comparePriceText: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },
  stockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  stockDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Options (Variants)
  variantsContainer: {
    gap: 16,
    marginBottom: 18,
  },
  optionSection: {
    gap: 10,
  },
  optionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionValueText: {
    fontWeight: '500',
  },
  sizeGuideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sizeGuideText: {
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  swatchesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  swatchOuterRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchInnerCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  whiteSwatchBorder: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeCard: {
    minWidth: 50,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeCardText: {
    fontSize: 13,
  },

  // Purchase section
  purchaseSection: {
    gap: 10,
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 110,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 8,
  },
  stepperActionBtn: {
    width: 30,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCountText: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  primaryAddBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  primaryAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryBuyBtn: {
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBuyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  microTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  microTrustText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Product Details Card
  detailsCard: {
    marginVertical: 14,
    gap: 10,
  },
  detailsSectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  detailsBodyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  specsTable: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 6,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  specKey: {
    fontSize: 12,
    fontWeight: '500',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  specDivider: {
    height: 1,
    width: '100%',
  },

  // Dividers & Utility
  divider: {
    height: 1,
    marginVertical: 18,
  },
  errorBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 350,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorSub: {
    fontSize: 13,
    textAlign: 'center',
  },
  browseBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  browseBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
