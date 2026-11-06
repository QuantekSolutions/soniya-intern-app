import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Pressable,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';

import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { fetchProduct, Product } from '../../../lib/api';
import { loadProductPhoto, saveProductPhoto } from '../../../lib/storage';
import { useFavorites } from '../../context/FavoritesContext';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const { isFavorite, toggleFavorite } = useFavorites();

  const loadProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProduct(id);
      setProduct(data);

      const savedPhoto = await loadProductPhoto(Number(id));
      setPhotoUri(savedPhoto);
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

  const openSettings = () => {
    Linking.openSettings();
  };

  const takePhoto = async () => {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Camera permission is needed to take a photo.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: openSettings,
          },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      setPhotoUri(uri);
      await saveProductPhoto(Number(id), uri);
    }
  };

  const chooseFromGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Photo library permission is needed to choose a photo.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: openSettings,
          },
        ]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      setPhotoUri(uri);
      await saveProductPhoto(Number(id), uri);
    }
  };

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

        <Text style={styles.heading}>Product Photo</Text>

        {photoUri && (
          <Image
            source={{ uri: photoUri }}
            style={styles.photoPreview}
            resizeMode="cover"
          />
        )}

        <Pressable
          style={styles.photoButton}
          onPress={takePhoto}
        >
          <Text style={styles.photoButtonText}>
            📷 Add Photo
          </Text>
        </Pressable>

        <Pressable
          style={styles.galleryButton}
          onPress={chooseFromGallery}
        >
          <Text style={styles.galleryButtonText}>
            🖼️ Choose from Gallery
          </Text>
        </Pressable>

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
  photoPreview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  photoButton: {
    backgroundColor: '#6264e8',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  photoButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  galleryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#6264e8',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  galleryButtonText: {
    color: '#6264e8',
    fontWeight: 'bold',
    fontSize: 16,
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