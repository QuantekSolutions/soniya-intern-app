import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { Product } from '../../lib/api';

type ProductCardProps = {
  product: Product;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export default function ProductCard({
  product,
  isFavorite,
  onPress,
  onToggleFavorite,
}: ProductCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.image}
          resizeMode="contain"
        />

        <Pressable
          style={styles.heartButton}
          onPress={onToggleFavorite}
          hitSlop={8}
        >
          <Text style={styles.heart}>
            {isFavorite ? '❤️' : '♡'}
          </Text>
        </Pressable>

        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>
            ★ {Number(product.rating).toFixed(1)}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={styles.price}>
            ${Number(product.price).toFixed(2)}
          </Text>
          <Text style={styles.viewText}>View →</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0E7DF',
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.9,
  },
  imageContainer: {
    height: 155,
    backgroundColor: '#F5E9E5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  heart: {
    fontSize: 20,
    color: '#A66F72',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 9,
    left: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#80664D',
  },
  info: {
    padding: 12,
    gap: 10,
  },
  title: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    color: '#382B2B',
    minHeight: 38,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#906466',
  },
  viewText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A66F72',
  },
});