
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
    <View style={styles.card}>
      <Pressable style={styles.product} onPress={onPress}>
        <Image
          source={{ uri: product.thumbnail }}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {product.title}
          </Text>

          <Text style={styles.price}>${product.price}</Text>

          <Text style={styles.rating}>
            ⭐ {product.rating}
          </Text>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          style={styles.heartButton}
          onPress={onToggleFavorite}
        >
          <Text style={styles.heart}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  product: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  image: {
    width: 90,
    height: 90,
    backgroundColor: '#f5f6fa',
    borderRadius: 8,
  },
  info: {
    flex: 1,
    gap: 7,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#17202a',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6264e8',
  },
  rating: {
    fontSize: 14,
    color: '#555555',
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    padding: 8,
  },
  heart: {
    fontSize: 25,
  },
});
