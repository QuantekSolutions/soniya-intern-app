
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';

import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { fetchProduct, Product } from '../../../lib/api';
import { useFavorites } from '../../context/FavoritesContext';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isFavorite, toggleFavorite } = useFavorites();

  const loadProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProduct(id);
      setProduct(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6264e8" />
        <Text>Loading product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error || 'Product not found'}
        </Text>

        <Pressable style={styles.button} onPress={loadProduct}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const favorite = isFavorite(product.id);

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.thumbnail }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.details}>
        <Text style={styles.title}>{product.title}</Text>

        <Text style={styles.price}>${product.price}</Text>

        <Text style={styles.category}>
          Category: {product.category}
        </Text>

        <Text style={styles.rating}>
          Rating: ⭐ {product.rating}
        </Text>

        <Text style={styles.heading}>Description</Text>

        <Text style={styles.description}>
          {product.description}
        </Text>

        <Pressable
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(product.id)}
        >
          <Text style={styles.favoriteButtonText}>
            {favorite
              ? '❤️ Remove from Favorites'
              : '🤍 Add to Favorites'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },
  image: {
    width: '100%',
    height: 280,
    backgroundColor: '#ffffff',
  },
  details: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#17202a',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6264e8',
  },
  category: {
    fontSize: 16,
    color: '#555555',
  },
  rating: {
    fontSize: 16,
    color: '#17202a',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#17202a',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555555',
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6264e8',
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  favoriteButton: {
    backgroundColor: '#6264e8',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  favoriteButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
