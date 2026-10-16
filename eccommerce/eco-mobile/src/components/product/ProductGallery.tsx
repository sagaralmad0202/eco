import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';

const { width } = Dimensions.get('window');

interface ProductGalleryProps {
  images: string[];
  productName?: string;
  tag?: string | null;
  isLiked?: boolean;
  onToggleWishlist?: () => void;
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
};

export default function ProductGallery({
  images,
  productName = 'Product',
  tag,
  isLiked = false,
  onToggleWishlist,
}: ProductGalleryProps) {
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewImgUrl, setPreviewImgUrl] = useState<string>('');
  const scrollRef = useRef<ScrollView>(null);

  const galleryImages =
    images && images.length > 0
      ? images
      : [
          'https://br-muddy-band-ayomzhrn.storage.c-5.us-east-2.aws.neon.tech/images/products/p1.webp',
        ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slide !== activeIndex && slide >= 0 && slide < galleryImages.length) {
      setActiveIndex(slide);
    }
  };

  const jumpToSlide = (idx: number) => {
    setActiveIndex(idx);
    scrollRef.current?.scrollTo({
      x: idx * width,
      animated: true,
    });
  };

  const openPreview = (url: string) => {
    setPreviewImgUrl(url);
    setPreviewModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Main Swipeable Carousel */}
      <View style={styles.carouselWrap}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.carouselScroll}
        >
          {galleryImages.map((imgUrl, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.95}
              onPress={() => openPreview(imgUrl)}
              style={[
                styles.slideItem,
                {
                  backgroundColor: isLight ? '#f9fafb' : '#1c1c1e',
                  borderColor: isLight ? '#EAE8E3' : '#2D2D30',
                },
              ]}
            >
              <Image
                source={
                  typeof imgUrl === 'string' && imgUrl.startsWith('http')
                    ? { uri: imgUrl }
                    : LOCAL_ASSETS_MAP['1']
                }
                style={styles.mainImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Floating Heart / Wishlist Button */}
        {onToggleWishlist && (
          <TouchableOpacity
            style={[
              styles.wishlistBtn,
              {
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(30, 30, 32, 0.92)',
              },
            ]}
            onPress={onToggleWishlist}
            activeOpacity={0.8}
            hitSlop={8}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={20}
              color={isLiked ? '#ef4444' : theme.text}
            />
          </TouchableOpacity>
        )}

        {/* Badge overlay */}
        {tag && (
          <View
            style={[
              styles.badge,
              tag.includes('🔥') ? styles.badgeHot : styles.badgeNew,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                tag.includes('🔥') && styles.badgeHotText,
              ]}
            >
              {tag}
            </Text>
          </View>
        )}

        {/* Image index counter */}
        {galleryImages.length > 1 && (
          <View
            style={[
              styles.imageCounterBadge,
              {
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(20, 20, 22, 0.9)',
                borderColor: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)',
              },
            ]}
          >
            <Text style={[styles.imageCounterText, { color: theme.text }]}>
              {activeIndex + 1}/{galleryImages.length}
            </Text>
          </View>
        )}

        {/* Dots indicator */}
        {galleryImages.length > 1 && (
          <View style={styles.dotsRow}>
            {galleryImages.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  activeIndex === i
                    ? [styles.activeDot, { backgroundColor: theme.text }]
                    : [styles.inactiveDot, { backgroundColor: isLight ? '#d1d5db' : '#52525b' }],
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Thumbnails row */}
      {galleryImages.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbsContainer}
        >
          {galleryImages.map((imgUrl, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => jumpToSlide(i)}
              activeOpacity={0.8}
              style={[
                styles.thumbBox,
                {
                  backgroundColor: isLight ? '#f9fafb' : '#1c1c1e',
                  borderColor:
                    activeIndex === i
                      ? theme.text
                      : isLight
                      ? '#EAE8E3'
                      : '#2D2D30',
                  borderWidth: activeIndex === i ? 2 : 1,
                },
              ]}
            >
              <Image
                source={
                  typeof imgUrl === 'string' && imgUrl.startsWith('http')
                    ? { uri: imgUrl }
                    : LOCAL_ASSETS_MAP['1']
                }
                style={styles.thumbImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Fullscreen Preview Modal */}
      <Modal
        visible={previewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setPreviewModalVisible(false)}
            hitSlop={10}
          >
            <Ionicons name="close" size={26} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            {!!previewImgUrl && (
              <Image
                source={{ uri: previewImgUrl }}
                style={styles.fullscreenImg}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  carouselWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.95,
  },
  carouselScroll: {
    width: '100%',
    height: '100%',
  },
  slideItem: {
    width: width,
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    borderWidth: 0,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 2,
    letterSpacing: 0.5,
  },
  badgeNew: {
    backgroundColor: '#000000',
  },
  badgeHot: {
    backgroundColor: '#dc2626',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgeHotText: {
    color: '#ffffff',
  },
  imageCounterBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  imageCounterText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 22,
    borderRadius: 3,
  },
  inactiveDot: {
    width: 6,
    borderRadius: 3,
  },
  thumbsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingHorizontal: 16,
  },
  thumbBox: {
    width: 68,
    height: 78,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImg: {
    width: '95%',
    height: '95%',
  },
});
