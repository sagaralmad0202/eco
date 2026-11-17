import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Toast } from '@ant-design/react-native';

import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { CardProduct, productsApi, ProductVariant } from '@/services/products-api';
import { formatInr } from '@/utils/currency';

const isAvailable = (variant: ProductVariant) =>
  variant.isActive !== false && variant.inStock !== false && variant.stock > 0;

const priceLabel = (variant: ProductVariant) => formatInr(variant.price);

export function QuickAddButton({ product }: { product: CardProduct }) {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { addToCart, isMutating } = useCart();
  const [isBusy, setIsBusy] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const pressScale = useRef(new Animated.Value(1)).current;
  const selectedVariant = variants.find((variant) => variant.id === selectedId);
  const inStock = product.inStock !== false;
  const disabled = !inStock || isBusy || isMutating;

  useEffect(() => {
    if (!isAdded) return;
    const timer = setTimeout(() => setIsAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [isAdded]);

  const setPressed = (pressed: boolean) => {
    Animated.spring(pressScale, {
      toValue: pressed ? 0.94 : 1,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  // A press can end in the same render that disables the control (busy state),
  // so make sure the pill never stays stuck in its pressed-down scale.
  useEffect(() => {
    if (!isBusy) return;
    Animated.spring(pressScale, {
      toValue: 1,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  }, [isBusy, pressScale]);

  const commitVariant = async (variant: ProductVariant) => {
    if (isAuthLoading) throw new Error('Please wait while we check your sign-in status.');
    if (!isAuthenticated) {
      setIsOpen(false);
      Toast.info('Please sign in to add products to your bag', 1.5);
      router.push('/login');
      return;
    }

    const result = await addToCart(variant.id, 1);
    if (!result.success) throw new Error(result.error || 'Could not add this item. Please try again.');
    setIsOpen(false);
    setIsAdded(true);
    Toast.show({ content: 'Added to your bag', duration: 1.5, position: 'bottom', mask: false });
  };

  const openQuickAdd = async () => {
    if (isAuthLoading) {
      Toast.info('Please wait while we check your sign-in status', 1.5);
      return;
    }
    if (!isAuthenticated) {
      Toast.info('Please sign in to add products to your bag', 1.5);
      router.push('/login');
      return;
    }
    if (pending.current || disabled) return;
    pending.current = true;
    setIsBusy(true);
    setError(null);
    try {
      // Fallback cards do not contain variant IDs; resolve them before adding.
      const options = product.variants?.length
        ? product.variants
        : (await productsApi.getBySlug(product.slug || product.id)).data.variants || [];
      const available = options.filter(isAvailable);
      if (available.length === 0) throw new Error('This item is currently out of stock.');
      if (available.length === 1) {
        await commitVariant(available[0]);
      } else {
        setVariants(options.filter((variant) => variant.isActive !== false));
        setSelectedId(null);
        setIsOpen(true);
      }
    } catch (err) {
      Toast.show({
        content: err instanceof Error ? err.message : 'Could not load options. Please try again.',
        duration: 2,
        mask: false,
      });
    } finally {
      pending.current = false;
      setIsBusy(false);
    }
  };

  const confirmSelection = async () => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      setIsOpen(false);
      Toast.info('Please sign in to add products to your bag', 1.5);
      router.push('/login');
      return;
    }
    if (pending.current || isMutating || !selectedVariant || !isAvailable(selectedVariant)) return;
    pending.current = true;
    setIsBusy(true);
    setError(null);
    try {
      await commitVariant(selectedVariant);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this item. Please try again.');
    } finally {
      pending.current = false;
      setIsBusy(false);
    }
  };

  const close = () => {
    if (!pending.current) setIsOpen(false);
  };

  return (
    <>
      <Animated.View style={[styles.buttonWrap, { transform: [{ scale: pressScale }] }]}>
        <TouchableOpacity
          onPress={openQuickAdd}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          disabled={disabled}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel={
            !inStock
              ? `${product.name} is sold out`
              : isAdded
                ? `${product.name} added to cart`
                : `Add ${product.name} to cart`
          }
          accessibilityState={{ disabled, busy: isBusy }}
          style={[styles.button, { backgroundColor: theme.text, opacity: !inStock ? 0.4 : 1 }]}
        >
          {isBusy ? (
            <ActivityIndicator size="small" color={theme.backgroundElement} />
          ) : (
            <>
              {inStock && (
                <Ionicons
                  name={isAdded ? 'checkmark' : 'add'}
                  size={15}
                  color={theme.backgroundElement}
                  style={styles.buttonIcon}
                  accessible={false}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              )}
              <Text style={[styles.buttonText, { color: theme.backgroundElement }]}>
                {!inStock ? 'Sold out' : isAdded ? 'Added' : 'Add'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close product options" accessibilityRole="button" />
          <View
            accessibilityViewIsModal
            style={[styles.sheet, { backgroundColor: theme.backgroundElement, paddingBottom: Math.max(insets.bottom, 16) + 12 }]}
          >
            <View style={styles.header}>
              <View style={styles.heading}>
                <Text style={[styles.title, { color: theme.text }]}>Choose an option</Text>
                <Text style={[styles.productName, { color: theme.textSecondary }]}>{product.name}</Text>
              </View>
              <TouchableOpacity onPress={close} disabled={isBusy} style={styles.close} accessibilityRole="button" accessibilityLabel="Close product options">
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.options} contentContainerStyle={styles.optionsContent}>
              {variants.map((variant) => {
                const available = isAvailable(variant);
                const selected = variant.id === selectedId;
                return (
                  <TouchableOpacity
                    key={variant.id}
                    disabled={!available || isBusy}
                    onPress={() => { setSelectedId(variant.id); setError(null); }}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityLabel={`${variant.title}, ${priceLabel(variant)}${available ? '' : ', sold out'}`}
                    accessibilityState={{ selected, checked: selected, disabled: !available || isBusy }}
                    style={[styles.option, { borderColor: selected ? theme.text : theme.backgroundSelected, opacity: available ? 1 : 0.4 }]}
                  >
                    <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={selected ? theme.text : theme.textSecondary} />
                    <Text style={[styles.optionTitle, { color: theme.text }]}>{variant.title}</Text>
                    <Text style={[styles.optionPrice, { color: theme.textSecondary }]}>{available ? priceLabel(variant) : 'Sold out'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            <TouchableOpacity
              onPress={confirmSelection}
              disabled={!selectedVariant || isBusy || isMutating}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ disabled: !selectedVariant || isBusy || isMutating, busy: isBusy }}
              style={[styles.confirm, { backgroundColor: theme.text, opacity: selectedVariant ? 1 : 0.4 }]}
            >
              {isBusy ? <ActivityIndicator color={theme.backgroundElement} /> : (
                <>
                  <Ionicons name="bag-add-outline" size={20} color={theme.backgroundElement} />
                  <Text style={[styles.confirmText, { color: theme.backgroundElement }]}>Add to cart{selectedVariant ? ` · ${priceLabel(selectedVariant)}` : ''}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  buttonWrap: { minWidth: 64, height: 44, justifyContent: 'center' },
  button: {
    minWidth: 64,
    height: 32,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 10,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonIcon: { marginTop: -0.5 },
  buttonText: { fontSize: 12, lineHeight: 15, fontWeight: '600', letterSpacing: 0.1, includeFontPadding: false },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { maxHeight: '80%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 12 },
  heading: { flex: 1 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '600', letterSpacing: -0.4 },
  productName: { fontSize: 14, lineHeight: 20, marginTop: 6 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  options: { flexShrink: 1 },
  optionsContent: { gap: 10, paddingBottom: 4 },
  option: { minHeight: 56, padding: 14, borderWidth: 1, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionTitle: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  optionPrice: { fontSize: 13, lineHeight: 18 },
  error: { marginTop: 12, fontSize: 13, lineHeight: 18, color: '#DC2626' },
  confirm: { minHeight: 50, padding: 14, borderRadius: 10, marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  confirmText: { flexShrink: 1, fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
