import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/context/auth-context';
import {
  reviewsApi,
  ReviewItem,
  ReviewSummary,
  ReviewPagination,
} from '@/services/reviews-api';

interface ReviewsSectionProps {
  productId: string;
  onSummaryUpdate?: (summary: ReviewSummary) => void;
}

const AVATAR_COLORS = [
  '#3b82f6',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#6366f1',
];

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function StarRow({
  rating,
  size = 14,
  interactive = false,
  onRate,
}: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={!interactive}
          onPress={() => onRate && onRate(star)}
          activeOpacity={0.7}
          hitSlop={interactive ? 6 : 0}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#eab308' : '#d1d5db'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ReviewsSection({ productId, onSummaryUpdate }: ReviewsSectionProps) {
  const router = useRouter();
  const theme = useTheme();
  const isLight = theme.background === '#F8F7F4';
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {},
  });
  const [pagination, setPagination] = useState<ReviewPagination>({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest_rating' | 'lowest_rating'>('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [ratingInput, setRatingInput] = useState(5);
  const [titleInput, setTitleInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, reviewsRes] = await Promise.all([
        reviewsApi.getReviewSummary(productId).catch(() => ({
          success: false,
          data: { averageRating: 4.5, totalReviews: 0, ratingDistribution: {} },
        })),
        reviewsApi.getProductReviews(productId, { page, limit: 6, sort }).catch(() => ({
          success: false,
          data: {
            reviews: [],
            pagination: { page: 1, limit: 6, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
          },
        })),
      ]);

      if (summaryRes?.data) {
        setSummary(summaryRes.data);
        if (onSummaryUpdate) {
          onSummaryUpdate(summaryRes.data);
        }
      }

      if (reviewsRes?.data?.reviews) {
        setReviews(reviewsRes.data.reviews);
        setPagination(reviewsRes.data.pagination);
      }
    } catch (err: any) {
      console.warn('Failed to load reviews:', err);
      setError('Unable to load reviews for this product.');
    } finally {
      setLoading(false);
    }
  }, [productId, page, sort, onSummaryUpdate]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const openWriteModal = (reviewToEdit?: ReviewItem) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (reviewToEdit) {
      setEditingReview(reviewToEdit);
      setRatingInput(reviewToEdit.rating);
      setTitleInput(reviewToEdit.title || '');
      setCommentInput(reviewToEdit.comment || '');
    } else {
      setEditingReview(null);
      setRatingInput(5);
      setTitleInput('');
      setCommentInput('');
    }
    setFormError(null);
    setWriteModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (ratingInput < 1 || ratingInput > 5) {
      setFormError('Please select a star rating (1 to 5).');
      return;
    }
    if (!commentInput.trim()) {
      setFormError('Please write your review comment.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingReview) {
        await reviewsApi.updateReview(editingReview.id, {
          rating: ratingInput,
          comment: commentInput.trim(),
          title: titleInput.trim() || null,
        });
      } else {
        await reviewsApi.createReview(productId, {
          rating: ratingInput,
          comment: commentInput.trim(),
          title: titleInput.trim() || undefined,
        });
      }
      setWriteModalOpen(false);
      fetchReviews();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await reviewsApi.deleteReview(deletingId);
      setDeleteModalOpen(false);
      setDeletingId(null);
      fetchReviews();
    } catch (err: any) {
      console.warn('Failed to delete review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgFormatted = summary.averageRating > 0 ? summary.averageRating.toFixed(1) : '0.0';
  const count = summary.totalReviews || 0;

  return (
    <View style={styles.section} id="reviews">
      {/* Header with aggregate rating & write review button */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.avgTitleRow}>
            <Ionicons name="star" size={22} color="#eab308" />
            <Text style={[styles.avgRatingText, { color: theme.text }]}>
              {avgFormatted}
            </Text>
            <Text style={[styles.countText, { color: theme.textSecondary }]}>
              · {count} {count === 1 ? 'Review' : 'Reviews'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.writeBtn, { backgroundColor: theme.text }]}
          onPress={() => openWriteModal()}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={16} color={theme.backgroundElement} />
          <Text style={[styles.writeBtnText, { color: theme.backgroundElement }]}>
            Write a review
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort row */}
      {count > 0 && (
        <View style={styles.sortContainer}>
          <Text style={[styles.sortLabel, { color: theme.textSecondary }]}>Sort by:</Text>
          <View style={styles.sortChips}>
            {[
              { id: 'newest', label: 'Newest' },
              { id: 'highest_rating', label: 'Top Rated' },
              { id: 'lowest_rating', label: 'Lowest' },
            ].map((chip) => {
              const active = sort === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[
                    styles.sortChip,
                    active
                      ? { backgroundColor: theme.text, borderColor: theme.text }
                      : { backgroundColor: isLight ? '#f4f4f5' : '#222225', borderColor: isLight ? '#e5e7eb' : '#333336' },
                  ]}
                  onPress={() => setSort(chip.id as any)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      { color: active ? theme.backgroundElement : theme.textSecondary },
                    ]}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Reviews list */}
      {loading && reviews.length === 0 ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="small" color={theme.text} />
        </View>
      ) : error ? (
        <View style={[styles.errorCard, { backgroundColor: isLight ? '#fef2f2' : '#2c1616' }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchReviews} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : reviews.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: isLight ? '#f9fafb' : '#1c1c1f', borderColor: isLight ? '#e5e7eb' : '#2c2c30' },
          ]}
        >
          <Ionicons name="chatbubbles-outline" size={36} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No reviews yet</Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            Be the first to share your thoughts about this product!
          </Text>
        </View>
      ) : (
        <View style={styles.reviewsList}>
          {reviews.map((item, idx) => {
            const author = item.user;
            const authorName = author?.fullName || 'Verified Buyer';
            const initial = authorName.charAt(0).toUpperCase() || 'U';
            const isOwner = user?.id && author?.id && user.id === author.id;
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

            return (
              <View
                key={item.id}
                style={[
                  styles.reviewCard,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: isLight ? '#f1f1f3' : '#2c2c30',
                  },
                ]}
              >
                {/* Author row */}
                <View style={styles.reviewHeader}>
                  <View style={styles.authorInfo}>
                    {author?.avatarUrl ? (
                      <Image source={{ uri: author.avatarUrl }} style={styles.avatarImg} />
                    ) : (
                      <View style={[styles.avatarFallback, { backgroundColor: avatarColor }]}>
                        <Text style={styles.avatarInitial}>{initial}</Text>
                      </View>
                    )}
                    <View style={styles.authorMeta}>
                      <View style={styles.nameRow}>
                        <Text style={[styles.authorName, { color: theme.text }]}>
                          {authorName}
                        </Text>
                        {isOwner && (
                          <View style={styles.youBadge}>
                            <Text style={styles.youText}>You</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>
                  </View>

                  {/* Rating + Owner Actions */}
                  <View style={styles.headerRight}>
                    <StarRow rating={item.rating} size={14} />
                    {isOwner && (
                      <View style={styles.ownerActions}>
                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={() => openWriteModal(item)}
                          hitSlop={8}
                        >
                          <Ionicons name="pencil" size={14} color={theme.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={() => {
                            setDeletingId(item.id);
                            setDeleteModalOpen(true);
                          }}
                          hitSlop={8}
                        >
                          <Ionicons name="trash-outline" size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                {/* Title and Comment */}
                {!!item.title && (
                  <Text style={[styles.reviewTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                )}
                <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>
                  {item.comment}
                </Text>
              </View>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <View style={styles.paginationRow}>
              <TouchableOpacity
                disabled={!pagination.hasPreviousPage || loading}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                style={[
                  styles.pageBtn,
                  { borderColor: isLight ? '#d1d5db' : '#444' },
                  !pagination.hasPreviousPage && styles.disabledBtn,
                ]}
              >
                <Text style={[styles.pageBtnText, { color: theme.text }]}>Previous</Text>
              </TouchableOpacity>
              <Text style={[styles.pageInfoText, { color: theme.textSecondary }]}>
                {pagination.page} of {pagination.totalPages}
              </Text>
              <TouchableOpacity
                disabled={!pagination.hasNextPage || loading}
                onPress={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                style={[
                  styles.pageBtn,
                  { borderColor: isLight ? '#d1d5db' : '#444' },
                  !pagination.hasNextPage && styles.disabledBtn,
                ]}
              >
                <Text style={[styles.pageBtnText, { color: theme.text }]}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Write / Edit Modal */}
      <Modal visible={writeModalOpen} transparent animationType="slide" onRequestClose={() => setWriteModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingReview ? 'Edit Your Review' : 'Write a Review'}
              </Text>
              <TouchableOpacity onPress={() => setWriteModalOpen(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
            </View>

            {formError && (
              <View style={styles.formErrorBox}>
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            )}

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Your Rating *</Text>
            <View style={styles.starPickRow}>
              <StarRow rating={ratingInput} size={28} interactive onRate={setRatingInput} />
              <Text style={[styles.starPickVal, { color: theme.text }]}>{ratingInput} / 5</Text>
            </View>

            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Review Title (optional)</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  backgroundColor: isLight ? '#f9fafb' : '#222225',
                  borderColor: isLight ? '#e5e7eb' : '#333336',
                },
              ]}
              placeholder="e.g. Beautiful leather craftsmanship"
              placeholderTextColor="#9ca3af"
              value={titleInput}
              onChangeText={setTitleInput}
              maxLength={150}
            />

            <View style={styles.commentLabelRow}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Your Review *</Text>
              <Text style={[styles.counterText, { color: theme.textSecondary }]}>
                {commentInput.length}/2000
              </Text>
            </View>
            <TextInput
              style={[
                styles.textAreaInput,
                {
                  color: theme.text,
                  backgroundColor: isLight ? '#f9fafb' : '#222225',
                  borderColor: isLight ? '#e5e7eb' : '#333336',
                },
              ]}
              placeholder="Share what you liked or how it fits..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              value={commentInput}
              onChangeText={setCommentInput}
              maxLength={2000}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: isLight ? '#e5e7eb' : '#333' }]}
                onPress={() => setWriteModalOpen(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.text }]}
                onPress={handleSubmitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={theme.backgroundElement} />
                ) : (
                  <Text style={[styles.submitBtnText, { color: theme.backgroundElement }]}>
                    {editingReview ? 'Update review' : 'Submit review'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalOpen} transparent animationType="fade" onRequestClose={() => setDeleteModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.deleteDialog, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.deleteIconWrap}>
              <Ionicons name="trash-outline" size={28} color="#ef4444" />
            </View>
            <Text style={[styles.deleteTitle, { color: theme.text }]}>Delete your review?</Text>
            <Text style={[styles.deleteSub, { color: theme.textSecondary }]}>
              This action cannot be undone. Are you sure you want to delete this review?
            </Text>
            <View style={styles.deleteBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: isLight ? '#e5e7eb' : '#333' }]}
                onPress={() => setDeleteModalOpen(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmDeleteBtn, { backgroundColor: '#ef4444' }]}
                onPress={handleDeleteReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginVertical: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  avgTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avgRatingText: {
    fontSize: 20,
    fontWeight: '800',
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
  },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  writeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortChips: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  authorMeta: {
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  youBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  youText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4b5563',
  },
  dateText: {
    fontSize: 11,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  starRow: {
    flexDirection: 'row',
    gap: 3,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconBtn: {
    padding: 4,
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 2,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  loaderBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  errorCard: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
  },
  retryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#dc2626',
    borderRadius: 14,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pageBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.35,
  },
  pageInfoText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  formErrorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  formErrorText: {
    color: '#b91c1c',
    fontSize: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  starPickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  starPickVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  textInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  commentLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 11,
  },
  textAreaInput: {
    height: 100,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
    paddingBottom: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteDialog: {
    margin: 24,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  deleteIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  deleteTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  deleteSub: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  deleteBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
  },
  confirmDeleteBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  confirmDeleteText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
