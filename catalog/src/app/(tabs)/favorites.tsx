
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { fetchProducts, Product } from '../../../lib/api';
import ProductCard from '../../components/ProductCard';
import { useFavorites } from '../../context/FavoritesContext';

export default function FavoritesScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Something went wrong'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const favoriteProducts = products.filter((product) =>
    favorites.includes(product.id)
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6264e8" />
        <Text>Loading favorites...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text
          style={styles.retry}
          onPress={() => router.replace('/(tabs)/favorites')}
        >
          Retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Favorites</Text>

      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No favorite products yet. Add products using the heart button.
          </Text>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            isFavorite={isFavorite(item.id)}
            onPress={() => router.push(`/product/${item.id}`)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#17202a',
  },
  separator: {
    height: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 16,
    marginTop: 30,
    lineHeight: 24,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  retry: {
    color: '#6264e8',
    fontWeight: 'bold',
    padding: 10,
  },
});
