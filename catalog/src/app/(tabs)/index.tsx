import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProducts, Product } from "../../../lib/api";
import ProductCard from "../../components/ProductCard";
import { useFavorites } from "../../context/FavoritesContext";

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  const { isFavorite, toggleFavorite } = useFavorites();

  const loadProducts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const fetchInitialProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.title.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [products, search]);

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      isFavorite={isFavorite(item.id)}
      onPress={() => router.push(`/product/${item.id}`)}
      onToggleFavorite={() => toggleFavorite(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A66F72" />
        <Text style={styles.loadingText}>
          Preparing your beauty collection...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => loadProducts()}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => loadProducts(true)}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.topHeader}>
              <Text style={styles.eyebrow}>THE BEAUTY EDIT</Text>

              <Text style={styles.heading}>DISCOVER YOUR STYLE ✨</Text>

              <Text style={styles.subtitle}>
                A little beauty, a little luxury, just for you.
              </Text>

              <View style={styles.decorativeLine} />
            </View>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search your favourites..."
                placeholderTextColor="#A99B96"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />

              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Text style={styles.clearText}>✕</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Our Collection</Text>
                <Text style={styles.sectionSubtitle}>
                  Thoughtfully picked for you
                </Text>
              </View>

              <Text style={styles.count}>{filteredProducts.length} items</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No products found. Try another search.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF6F0",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAF6F0",
    padding: 20,
    gap: 14,
  },
  loadingText: {
    color: "#806F69",
    fontSize: 14,
  },
  topHeader: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: "700",
    color: "#A66F72",
    marginBottom: 13,
  },
  heading: {
    fontSize: 27,
    fontWeight: "700",
    fontFamily: "serif",
    color: "#382B2B",
    textAlign: "center",
    letterSpacing: 1.5,
    textTransform: "lowercase",
  },
  subtitle: {
    fontSize: 12,
    color: "#8E7D76",
    marginTop: 9,
    textAlign: "center",
  },
  decorativeLine: {
    width: 42,
    height: 2,
    backgroundColor: "#B18A58",
    marginTop: 17,
    borderRadius: 2,
  },
  searchBox: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EFE5DC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  searchIcon: {
    fontSize: 27,
    color: "#A66F72",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#382B2B",
    paddingVertical: 0,
  },
  clearText: {
    color: "#A66F72",
    fontSize: 16,
    padding: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#382B2B",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: "#9A8981",
    marginTop: 4,
  },
  count: {
    fontSize: 11,
    color: "#906466",
    fontWeight: "700",
    backgroundColor: "#F1E3DF",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
  },
  row: {
    justifyContent: "space-between",
    gap: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    color: "#8E7D76",
    marginTop: 35,
  },
  error: {
    fontSize: 15,
    color: "#B34F55",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#A66F72",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
