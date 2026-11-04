
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
} from 'react-native';

import { Link, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { fetchProducts, Product } from '../../../lib/api';
import ProductCard from '../../components/ProductCard';
import { useFavorites } from '../../context/FavoritesContext';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();

  const loadProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <ProductCard
        product={item}
        isFavorite={isFavorite(item.id)}
        onPress={() => router.push(`/product/${item.id}`)}
        onToggleFavorite={() => toggleFavorite(item.id)}
      />

      <Link href={`/product/${item.id}`} asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>View Details (Link)</Text>
        </Pressable>
      </Link>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6264e8" />
        <Text>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <Pressable
          style={styles.button}
          onPress={() => loadProducts()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Products</Text>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found</Text>
        }
        refreshing={refreshing}
        onRefresh={() => loadProducts(true)}
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
  productContainer: {
    gap: 8,
  },
  separator: {
    height: 15,
  },
  linkButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  linkText: {
    color: '#6264e8',
    fontWeight: '600',
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
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginTop: 30,
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});
