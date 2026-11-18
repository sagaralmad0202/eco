import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { QuickAddButton } from '@/components/product/QuickAddButton';
import { productsApi, CardProduct } from '@/services/products-api';

const { width } = Dimensions.get('window');

interface RelatedProductsProps {
  currentProductId?: string;
  currentProductSlug?: string;
}

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

function ProductCardImage({ imageUrl, slug }: { imageUrl?: string; slug?: string }) {
  const [error, setError] = useState(false);
  const fallback =
    (slug && LOCAL_ASSETS_MAP[slug]) ||
    LOCAL_ASSETS_MAP['leather-tote-bag'] ||
    LOCAL_ASSETS_MAP['1'];

  if (!imageUrl || error) {
    return <Image source={fallback} style={styles.cardImg} resizeMode="cover" />;
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.cardImg}
      resizeMode="cover"
      onError={() => setError(true)}
    />
  );
}

export default function RelatedProducts({
  currentProductId,
  currentProductSlug,
}: RelatedProductsProps) {
  const router = useRouter();
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadRelated() {
      try {
        setLoading(true);
        const res = await productsApi.list({ limit: 12 });
        if (mounted && res?.items) {
          const filtered = res.items.filter(
            (p) =>
              p.id !== currentProductId &&
              p.slug !== currentProductSlug
          );
          setProducts(filtered);
        }
      } catch (e) {
        console.warn('Could not load related products:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadRelated();
    return () => {
      mounted = false;
    };
  }, [currentProductId, currentProductSlug]);

  if (!loading && products.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>
        Customers also purchased
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((item) => (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundElement,
                borderColor: isLight ? '#EAE8E3' : '#2D2D30',
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => router.push(`/product/${item.slug || item.id}` as any)}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel={`View ${item.name}`}
            >
              {/* Image Wrap */}
              <View
                style={[
                  styles.imgWrap,
                  { backgroundColor: isLight ? '#f9fafb' : '#1C1B19' },
                ]}
              >
                <ProductCardImage imageUrl={item.image} slug={item.slug} />

                {/* Tag / Badge */}
                {item.tag && (
                  <View
                    style={[
                      styles.tagBadge,
                      item.tag.includes('🔥') ? styles.tagHot : styles.tagNew,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        item.tag.includes('🔥') && styles.tagHotText,
                      ]}
                    >
                      {item.tag}
                    </Text>
                  </View>
                )}
              </View>

              {/* Info Body */}
              <View style={styles.cardBody}>
                {/* Swatches */}
                <View style={styles.swatchesRow}>
                  {item.colors.slice(0, 3).map((c, i) => (
                    <View
                      key={i}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c },
                        c.toLowerCase() === '#ffffff' && styles.colorDotBorder,
                      ]}
                    />
                  ))}
                </View>

                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.subRow}>
                  <Text style={[styles.sub, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                  {item.rating && (
                    <View style={styles.ratingBadge}>
                      <Text style={styles.starText}>★</Text>
                      <Text style={[styles.ratingVal, { color: theme.textSecondary }]}>
                        {item.rating}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.cardFooter}>
              <View style={styles.cardPrices}>
                <Text style={[styles.priceText, { color: theme.text }]}>{item.price}</Text>
                {item.oldPrice && (
                  <Text style={[styles.oldPriceText, { color: theme.textSecondary }]}>
                    {item.oldPrice}
                  </Text>
                )}
              </View>
              <QuickAddButton product={item} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  card: {
    width: width * 0.46,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imgWrap: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tagNew: {
    backgroundColor: '#111827',
  },
  tagHot: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  tagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  tagHotText: {
    color: '#dc2626',
  },
  cardBody: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 2,
  },
  swatchesRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  colorDotBorder: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  name: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 1,
  },
  sub: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  cardFooter: {
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    gap: 8,
  },
  cardPrices: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  priceText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'],
  },
  oldPriceText: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  starText: {
    color: '#eab308',
    fontSize: 11,
  },
  ratingVal: {
    fontSize: 11,
    fontWeight: '500',
  },
});
