import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  size?: number;
}

function StarRating({ rating, onRate, size = 36 }: StarRatingProps) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onRate(star)}>
          <Text style={[styles.star, { fontSize: size }]}>
            {star <= rating ? '★' : '☆'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

interface RatingModalProps {
  visible: boolean;
  hasDriver: boolean;
  onSubmit: (data: {
    restaurantRating: number;
    driverRating?: number;
    comment?: string;
  }) => void;
  onDismiss: () => void;
  isSubmitting: boolean;
}

export function RatingModal({
  visible,
  hasDriver,
  onSubmit,
  onDismiss,
  isSubmitting,
}: RatingModalProps) {
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [comment, setComment] = useState('');

  const canSubmit = restaurantRating > 0 && (!hasDriver || driverRating > 0);

  function handleSubmit() {
    onSubmit({
      restaurantRating,
      driverRating: hasDriver ? driverRating : undefined,
      comment: comment.trim() || undefined,
    });
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>🎉 Order Delivered!</Text>
          <Text style={styles.subtitle}>How was your experience?</Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Restaurant</Text>
            <StarRating
              rating={restaurantRating}
              onRate={setRestaurantRating}
            />
          </View>

          {hasDriver && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Driver</Text>
              <StarRating rating={driverRating} onRate={setDriverRating} />
            </View>
          )}

          <TextInput
            style={styles.input}
            placeholder="Leave a comment (optional)"
            placeholderTextColor="#aaa"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={2}
          />

          <Pressable
            style={[
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Review</Text>
            )}
          </Pressable>

          <Pressable style={styles.skipButton} onPress={onDismiss}>
            <Text style={styles.skipText}>Skip for now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
    gap: 6,
  },
  star: {
    color: '#FF6B35',
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#f0c4b0',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    padding: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#aaa',
  },
});
