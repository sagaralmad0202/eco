import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/screen-header';
import { MotionPressable, Reveal as FadeIn } from '@/components/ui/motion';
import { useTheme } from '@/hooks/use-theme';

const CART_ITEMS = [
  { id: '1', name: 'Basic Tee', meta: 'Sienna · Size L', price: '$199.00', qty: 1, image: require('@/assets/images/p1.webp') },
  { id: '2', name: 'Basic Coahuila', meta: 'Black · Size XL', price: '$99.00', qty: 1, image: require('@/assets/images/p2.webp') },
  { id: '3', name: 'Nomad Tumbler', meta: 'White · Size M', price: '$119.00', qty: 1, image: require('@/assets/images/p3.webp') },
];

export default function BagScreen() {
  const [items, setItems] = useState(CART_ITEMS);
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';

  const updateQty = useCallback((id: string, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const subtotal = items.reduce((sum, item) => {
    const price = parseFloat(item.price.replace('$', ''));
    return sum + price * item.qty;
  }, 0);
  const shipping = 5.00;
  const tax = subtotal * 0.0597;
  const total = subtotal + shipping + tax;

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.backgroundElement }]}>
      <StatusBar barStyle={isLight ? 'dark-content' : 'light-content'} backgroundColor={theme.backgroundElement} />

      <ScreenHeader title={'Shopping Cart'} accessory={
        <View style={[styles.itemCountBadge, { backgroundColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
          <Text style={[styles.itemCountText, { color: theme.textSecondary }]}>{items.length}</Text>
        </View>
      } />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: theme.background }}>
        {/* Cart Items */}
        {items.map((item, index) => (
          <FadeIn exitLeft key={item.id} delay={index * 40}>
            <View style={[styles.cartRow, { backgroundColor: theme.backgroundElement, borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
              <View style={[styles.cartImgWrap, { backgroundColor: isLight ? '#f9fafb' : '#1C1B19' }]}>
                <Image source={item.image} style={styles.cartImg} />
              </View>
              <View style={styles.cartBody}>
                <View>
                  <Text style={[styles.cartItemName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.cartItemMeta, { color: theme.textSecondary }]}>{item.meta}</Text>
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockDot}>●</Text>
                    <Text style={styles.stockText}>In Stock</Text>
                  </View>
                </View>
                <View style={styles.cartItemBottom}>
                  <View style={[styles.stepper, { backgroundColor: isLight ? '#f5f5f7' : '#2D2D30' }]}>
                    <MotionPressable
                      accessibilityLabel={'Decrease ' + item.name + ' quantity'}
                      accessibilityRole={'button'}
                      hitSlop={6}
                      onPress={() => updateQty(item.id, -1)}
                      pressedScale={0.92}
                      style={styles.stepperBtn}>
                      <Text style={[styles.stepperBtnText, { color: theme.text }]}>−</Text>
                    </MotionPressable>
                    <View style={[styles.stepperSep, { backgroundColor: isLight ? '#e5e7eb' : '#444' }]} />
                    <Text style={[styles.stepperVal, { color: theme.text }]}>{item.qty}</Text>
                    <View style={[styles.stepperSep, { backgroundColor: isLight ? '#e5e7eb' : '#444' }]} />
                    <MotionPressable
                      accessibilityLabel={'Increase ' + item.name + ' quantity'}
                      accessibilityRole={'button'}
                      hitSlop={6}
                      onPress={() => updateQty(item.id, 1)}
                      pressedScale={0.92}
                      style={styles.stepperBtn}>
                      <Text style={[styles.stepperBtnText, { color: theme.text }]}>+</Text>
                    </MotionPressable>
                  </View>
                  <Text style={[styles.cartItemPrice, { color: theme.text }]}>{item.price}</Text>
                </View>
                <MotionPressable
                  accessibilityLabel={'Remove ' + item.name + ' from bag'}
                  accessibilityRole={'button'}
                  hitSlop={6}
                  onPress={() => removeItem(item.id)}
                  pressedScale={0.96}
                  style={styles.removeButton}>
                  <Text style={styles.removeText}>Remove</Text>
                </MotionPressable>
              </View>
            </View>
          </FadeIn>
        ))}

        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Your bag is empty</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>Add items to your bag to see them here.</Text>
          </View>
        )}

        {/* Order Summary */}
        {items.length > 0 && (
          <FadeIn delay={350}>
            <View style={styles.summarySection}>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>Order Summary</Text>
              <View style={[styles.summaryBox, { backgroundColor: isLight ? '#FAF9F6' : '#1C1B19', borderColor: isLight ? '#EAE8E3' : '#2D2D30' }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Shipping estimate</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>${shipping.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Tax estimate</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>${tax.toFixed(2)}</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: isLight ? '#e5e7eb' : '#444' }]} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryTotalLabel, { color: theme.text }]}>Order Total</Text>
                  <Text style={[styles.summaryTotalValue, { color: theme.text }]}>${total.toFixed(2)}</Text>
                </View>
              </View>
            </View>

            <MotionPressable
              accessibilityRole={'button'}
              onPress={() => {}}
              style={[styles.checkoutBtn, { backgroundColor: theme.text }]}>
              <Text style={[styles.checkoutBtnText, { color: theme.backgroundElement }]}>Checkout</Text>
              <Text style={[styles.checkoutArrow, { color: theme.backgroundElement }]}>→</Text>
            </MotionPressable>

            <View style={styles.trustRow}>
              <Text style={[styles.trustItem, { color: theme.textSecondary }]}>🔒 Secure</Text>
              <Text style={[styles.trustItem, { color: theme.textSecondary }]}>📦 Free Returns</Text>
              <Text style={[styles.trustItem, { color: theme.textSecondary }]}>⭐ Top Rated</Text>
            </View>
          </FadeIn>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  itemCountBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCountText: { fontSize: 11, lineHeight: 14, fontWeight: '600', color: '#6b7280' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },

  // Cart row
  cartRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f0f0f2',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.025,
    shadowRadius: 8,
    elevation: 1,
  },
  cartImgWrap: { width: 80, height: 96, borderRadius: 12, overflow: 'hidden', backgroundColor: '#f9fafb' },
  cartImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cartBody: { flex: 1, marginLeft: 12 },
  cartItemName: { fontSize: 14, lineHeight: 19, fontWeight: '600', color: '#111827' },
  cartItemMeta: { fontSize: 12, lineHeight: 16, color: '#9ca3af', marginTop: 1 },
  stockBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  stockDot: { fontSize: 6, color: '#22c55e' },
  stockText: { fontSize: 11, fontWeight: '600', color: '#22c55e' },
  cartItemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  cartItemPrice: { fontSize: 15, lineHeight: 20, fontWeight: '700', color: '#111827' },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 9,
    overflow: 'hidden',
  },
  stepperBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  stepperBtnText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  stepperSep: { width: 1, height: 16, backgroundColor: '#e5e7eb' },
  stepperVal: { width: 32, textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#111827' },

  removeButton: {
    alignSelf: 'flex-start',
    minWidth: 44,
    minHeight: 32,
    justifyContent: 'center',
  },
  removeText: { fontSize: 12, lineHeight: 16, color: '#dc2626', fontWeight: '600' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptySub: { fontSize: 14, color: '#9ca3af' },

  // Summary
  summarySection: { marginTop: 10 },
  summaryTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: '#111827', marginBottom: 10 },
  summaryBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f2',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 13, lineHeight: 18, color: '#6b7280' },
  summaryValue: { fontSize: 13, lineHeight: 18, fontWeight: '600', color: '#111827' },
  summaryDivider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  summaryTotalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  summaryTotalValue: { fontSize: 18, fontWeight: '800', color: '#111827' },

  checkoutBtn: {
    backgroundColor: '#111827',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  checkoutBtnText: { color: '#fff', fontSize: 15, lineHeight: 20, fontWeight: '700' },
  checkoutArrow: { color: '#fff', fontSize: 16 },

  trustRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
  trustItem: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },
});
