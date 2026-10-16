import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Toast } from '@ant-design/react-native';

import { Reveal as FadeIn } from '@/components/ui/motion';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { cartApi } from '@/services/cart-api';

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

export default function BagScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isLight = theme.background === '#F8F7F4';
  const { isAuthenticated } = useAuth();

  const {
    items,
    cartCount,
    subtotal,
    shippingFee,
    tax,
    total,
    updateQuantity,
    removeItem,
    isLoading,
    refreshCart,
    error: cartError,
  } = useCart();

  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [imgLoadErrors, setImgLoadErrors] = useState<Record<string, boolean>>({});

  // Quantity updates with bounds checking & feedback
  const handleUpdateQty = useCallback(
    async (id: string, currentQty: number, delta: number, maxStock?: number) => {
      if (updatingItemId) return;
      const targetQty = currentQty + delta;

      if (targetQty < 1) {
        return; // Decrement must not reduce below minimum permitted (1)
      }

      if (maxStock !== undefined && targetQty > maxStock) {
        Toast.info(`Only ${maxStock} item${maxStock === 1 ? '' : 's'} in stock`, 1.5);
        return;
      }

      try {
        setUpdatingItemId(id);
        const res = await updateQuantity(id, targetQty);
        if (!res.success) {
          Toast.fail(res.error || 'Failed to update quantity', 2);
        }
      } catch (err: any) {
        Toast.fail(err.message || 'Network error updating cart', 2);
      } finally {
        setUpdatingItemId(null);
      }
    },
    [updateQuantity, updatingItemId]
  );

  // Professional removal confirmation and action
  const handleRemove = useCallback(
    (id: string, name: string) => {
      Alert.alert(
        'Remove Item',
        `Are you sure you want to remove ${name} from your cart?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                setUpdatingItemId(id);
                const res = await removeItem(id);
                if (res.success) {
                  Toast.info('Item removed from cart', 1.5);
                } else {
                  Toast.fail(res.error || 'Failed to remove item', 2);
                }
              } catch (err: any) {
                Toast.fail(err.message || 'Network error removing item', 2);
              } finally {
                setUpdatingItemId(null);
              }
            },
          },
        ]
      );
    },
    [removeItem]
  );

  // Checkout flow with validation & auth checks
  const handleCheckout = useCallback(async () => {
    if (items.length === 0) return;

    if (!isAuthenticated) {
      Toast.info('Please sign in to proceed to checkout', 2);
      router.push('/login');
      return;
    }

    try {
      setIsCheckingOut(true);
      const res = await cartApi.validateCart();
      if (res?.data?.adjustments && res.data.adjustments.length > 0) {
        Toast.info('Some item quantities were adjusted to match current stock', 2.5);
        await refreshCart();
        return;
      }

      Toast.success('Cart validated! Order ready for payment.', 2);
      // Route to profile or checkout
      router.push('/profile');
    } catch (err: any) {
      Toast.fail(err.message || 'Checkout unavailable right now', 2);
    } finally {
      setIsCheckingOut(false);
    }
  }, [items.length, isAuthenticated, router, refreshCart]);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={theme.background} />

      {/* Header matching screenshot: Title + compact badge */}
      <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Shopping Cart</Text>
          <View
            style={[
              styles.itemCountBadge,
              { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' },
            ]}
          >
            <Text style={[styles.itemCountText, { color: theme.textSecondary }]}>
              {cartCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Error alert banner if any */}
      {cartError && (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor: isLight ? '#FEF2F2' : '#3F1818',
              borderColor: isLight ? '#FECACA' : '#7F1D1D',
            },
          ]}
        >
          <AntDesign name="exclamation-circle" size={14} color="#DC2626" />
          <Text style={[styles.errorBannerText, { color: isLight ? '#991B1B' : '#FCA5A5' }]}>
            {cartError}
          </Text>
          <TouchableOpacity onPress={refreshCart} style={styles.errorBannerRetry}>
            <Text style={styles.errorBannerRetryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 60 + Math.max(insets.bottom, 16) + 30 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && !updatingItemId}
            onRefresh={refreshCart}
            tintColor={theme.text}
          />
        }
      >
        {/* Cart Items List */}
        {items.map((item, index) => {
          const product = item.variant?.product;
          const productName = product?.name || 'Product';
          const meta = item.variant?.title || 'Black / One Size';
          const stock = item.variant?.stock;
          const inStock = item.variant?.inStock !== false && (stock === undefined || stock > 0);

          const rawUnitPrice = item.unitPrice ? parseFloat(item.unitPrice) : 85.0;
          const formattedPrice = `$${rawUnitPrice.toFixed(2)}`;

          const imageUrl = product?.image;
          const hasImgError = imgLoadErrors[item.id];
          const fallback =
            (product?.slug && LOCAL_ASSETS_MAP[product.slug]) ||
            LOCAL_ASSETS_MAP['3'] ||
            LOCAL_ASSETS_MAP['1'];

          const isItemUpdating = updatingItemId === item.id;
          const canDecrement = item.quantity > 1;
          const canIncrement = stock === undefined || item.quantity < stock;

          return (
            <FadeIn delay={index * 40} key={item.id}>
              <View
                style={[
                  styles.cartCard,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: isLight ? '#EAE8E3' : '#2D2D30',
                  },
                ]}
              >
                {/* Left: Product Image */}
                <TouchableOpacity
                  style={[
                    styles.cartImgWrap,
                    { backgroundColor: isLight ? '#F5F5F7' : '#1C1B19' },
                  ]}
                  onPress={() => {
                    if (product?.slug) {
                      router.push(`/product/${product.slug}` as any);
                    }
                  }}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for ${productName}`}
                >
                  <Image
                    source={imageUrl && !hasImgError ? { uri: imageUrl } : fallback}
                    style={styles.cartImg}
                    onError={() =>
                      setImgLoadErrors((prev) => ({ ...prev, [item.id]: true }))
                    }
                  />
                </TouchableOpacity>

                {/* Right: Info & Actions */}
                <View style={styles.cartBody}>
                  {/* Product Title & Variant Details */}
                  <TouchableOpacity
                    onPress={() => {
                      if (product?.slug) {
                        router.push(`/product/${product.slug}` as any);
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={[styles.cartItemName, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {productName}
                    </Text>
                    <Text
                      style={[styles.cartItemMeta, { color: theme.textSecondary }]}
                      numberOfLines={1}
                    >
                      {meta}
                    </Text>

                    {/* Stock Status */}
                    <View style={styles.stockBadge}>
                      <View
                        style={[
                          styles.stockDot,
                          { backgroundColor: inStock ? '#22C55E' : '#EF4444' },
                        ]}
                      />
                      <Text
                        style={[
                          styles.stockText,
                          { color: inStock ? '#22C55E' : '#EF4444' },
                        ]}
                      >
                        {inStock ? 'In Stock' : 'Out of Stock'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Quantity Stepper & Price Row */}
                  <View style={styles.stepperAndPriceRow}>
                    {/* Stepper container */}
                    <View
                      style={[
                        styles.stepper,
                        { backgroundColor: isLight ? '#F4F3F0' : '#2A2927' },
                      ]}
                    >
                      <TouchableOpacity
                        accessibilityLabel={`Decrease ${productName} quantity`}
                        accessibilityRole="button"
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        onPress={() => handleUpdateQty(item.id, item.quantity, -1, stock)}
                        disabled={!canDecrement || isItemUpdating}
                        style={[
                          styles.stepperBtn,
                          { opacity: !canDecrement || isItemUpdating ? 0.35 : 1 },
                        ]}
                      >
                        <AntDesign name="minus" size={12} color={theme.text} />
                      </TouchableOpacity>

                      <View style={styles.stepperValWrap}>
                        {isItemUpdating ? (
                          <ActivityIndicator size="small" color={theme.text} />
                        ) : (
                          <Text style={[styles.stepperVal, { color: theme.text }]}>
                            {item.quantity}
                          </Text>
                        )}
                      </View>

                      <TouchableOpacity
                        accessibilityLabel={`Increase ${productName} quantity`}
                        accessibilityRole="button"
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        onPress={() => handleUpdateQty(item.id, item.quantity, 1, stock)}
                        disabled={!canIncrement || isItemUpdating}
                        style={[
                          styles.stepperBtn,
                          { opacity: !canIncrement || isItemUpdating ? 0.35 : 1 },
                        ]}
                      >
                        <AntDesign name="plus" size={12} color={theme.text} />
                      </TouchableOpacity>
                    </View>

                    {/* Item Price */}
                    <Text style={[styles.cartItemPrice, { color: theme.text }]}>
                      {formattedPrice}
                    </Text>
                  </View>

                  {/* Remove Button directly under Stepper */}
                  <TouchableOpacity
                    accessibilityLabel={`Remove ${productName} from shopping cart`}
                    accessibilityRole="button"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => handleRemove(item.id, productName)}
                    disabled={isItemUpdating}
                    style={styles.removeBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </FadeIn>
          );
        })}

        {/* Empty State */}
        {items.length === 0 && !isLoading && (
          <FadeIn delay={100}>
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: isLight ? '#EAE8E3' : '#2D2D30',
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: isLight ? '#F4F3F0' : '#2A2927' },
                ]}
              >
                <Ionicons
                  name="bag-handle-outline"
                  size={40}
                  color={isLight ? '#71717A' : '#A1A1AA'}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Your shopping bag is empty
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Explore our curated collection to discover sustainable, timeless pieces.
              </Text>
              <TouchableOpacity
                style={[styles.exploreBtn, { backgroundColor: theme.text }]}
                onPress={() => router.push('/shop')}
                activeOpacity={0.88}
                accessibilityRole="button"
              >
                <Text
                  style={[styles.exploreBtnText, { color: theme.backgroundElement }]}
                >
                  Explore Collection
                </Text>
                <AntDesign name="arrow-right" size={15} color={theme.backgroundElement} />
              </TouchableOpacity>
            </View>
          </FadeIn>
        )}

        {/* Order Summary & Checkout Section */}
        {items.length > 0 && (
          <FadeIn delay={200}>
            <View style={styles.summarySection}>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>
                Order Summary
              </Text>

              {/* Order Summary Card Container */}
              <View
                style={[
                  styles.summaryBox,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: isLight ? '#EAE8E3' : '#2D2D30',
                  },
                ]}
              >
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Subtotal
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    ${parseFloat(subtotal || '0').toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Shipping estimate
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    ${parseFloat(shippingFee || '5').toFixed(2)}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
                    Tax estimate
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    ${parseFloat(tax || '0').toFixed(2)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.summaryDivider,
                    { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' },
                  ]}
                />

                <View style={styles.summaryTotalRow}>
                  <Text style={[styles.summaryTotalLabel, { color: theme.text }]}>
                    Order Total
                  </Text>
                  <Text style={[styles.summaryTotalValue, { color: theme.text }]}>
                    ${parseFloat(total || '0').toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Checkout Button */}
              <TouchableOpacity
                accessibilityLabel="Proceed to checkout"
                accessibilityRole="button"
                onPress={handleCheckout}
                disabled={isCheckingOut || items.length === 0}
                activeOpacity={0.88}
                style={[
                  styles.checkoutBtn,
                  {
                    backgroundColor: theme.text,
                    opacity: isCheckingOut ? 0.75 : 1,
                  },
                ]}
              >
                {isCheckingOut ? (
                  <ActivityIndicator color={theme.backgroundElement} size="small" />
                ) : (
                  <>
                    <Text
                      style={[
                        styles.checkoutBtnText,
                        { color: theme.backgroundElement },
                      ]}
                    >
                      Checkout
                    </Text>
                    <AntDesign
                      name="arrow-right"
                      size={16}
                      color={theme.backgroundElement}
                    />
                  </>
                )}
              </TouchableOpacity>

              {/* Trust Indicators matching screenshot */}
              <View style={styles.trustRow}>
                <View style={styles.trustItem}>
                  <Text style={styles.trustEmoji}>🔒</Text>
                  <Text style={[styles.trustText, { color: theme.textSecondary }]}>
                    Secure
                  </Text>
                </View>
                <View style={styles.trustItem}>
                  <Text style={styles.trustEmoji}>📦</Text>
                  <Text style={[styles.trustText, { color: theme.textSecondary }]}>
                    Free Returns
                  </Text>
                </View>
                <View style={styles.trustItem}>
                  <Text style={styles.trustEmoji}>⭐</Text>
                  <Text style={[styles.trustText, { color: theme.textSecondary }]}>
                    Top Rated
                  </Text>
                </View>
              </View>
            </View>
          </FadeIn>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  itemCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    height: 22,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '600',
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  errorBannerRetry: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  errorBannerRetryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    textDecorationLine: 'underline',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },

  // Cart Item Card matching screenshot
  cartCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  cartImgWrap: {
    width: 88,
    height: 88,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cartImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cartBody: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  cartItemMeta: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Stepper & Price Row
  stepperAndPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 4,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValWrap: {
    minWidth: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperVal: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  cartItemPrice: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Remove Button
  removeBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 2,
  },
  removeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Empty State Card
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 23,
  },
  exploreBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Order Summary Section
  summarySection: {
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  summaryBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 10,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryTotalValue: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // Checkout Button
  checkoutBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  checkoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Trust Indicators
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    marginTop: 4,
    marginBottom: 16,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustEmoji: {
    fontSize: 12,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
