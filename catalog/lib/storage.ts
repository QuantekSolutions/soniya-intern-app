
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const FAVORITES_KEY = '@catalog_favorites';
const PRODUCT_PHOTOS_KEY = '@catalog_product_photos';

const getPhotoDirectory = () => {
  if (!FileSystem.documentDirectory) {
    throw new Error('App document directory is unavailable.');
  }

  return `${FileSystem.documentDirectory}product-photos/`;
};

async function ensurePhotoDirectory(): Promise<string> {
  const directory = getPhotoDirectory();
  const info = await FileSystem.getInfoAsync(directory);

  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory, {
      intermediates: true,
    });
  }

  return directory;
}

async function getProductPhotos(): Promise<Record<string, string>> {
  const data = await AsyncStorage.getItem(PRODUCT_PHOTOS_KEY);
  return data ? JSON.parse(data) : {};
}

function isManagedPhoto(uri: string, directory: string): boolean {
  return uri.startsWith(directory);
}

export async function loadFavorites(): Promise<number[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading favorites:', error);
    return [];
  }
}

export async function saveFavorites(ids: number[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  } catch (error) {
    console.error('Error saving favorites:', error);
    throw error;
  }
}

export async function loadProductPhoto(
  productId: number,
): Promise<string | null> {
  try {
    const photos = await getProductPhotos();
    const uri = photos[String(productId)];

    if (!uri) return null;

    const info = await FileSystem.getInfoAsync(uri);

    if (!info.exists) {
      console.warn('Saved product photo file is missing:', uri);
      return null;
    }

    return uri;
  } catch (error) {
    console.error('Error loading product photo:', error);
    return null;
  }
}

export async function saveProductPhoto(
  productId: number,
  sourceUri: string,
): Promise<void> {
  let newUri: string | null = null;

  try {
    const directory = await ensurePhotoDirectory();
    const photos = await getProductPhotos();
    const oldUri = photos[String(productId)];

    const extensionMatch = sourceUri
      .split('?')[0]
      .match(/\.(jpg|jpeg|png|webp)$/i);

    const extension = extensionMatch
      ? extensionMatch[1].toLowerCase()
      : 'jpg';

    const fileName = `product-${productId}-${Date.now()}.${extension}`;
    newUri = `${directory}${fileName}`;

    // Copy the cropped image into permanent app storage.
    await FileSystem.copyAsync({
      from: sourceUri,
      to: newUri,
    });

    // Update the saved reference only after the copy succeeds.
    photos[String(productId)] = newUri;

    try {
      await AsyncStorage.setItem(
        PRODUCT_PHOTOS_KEY,
        JSON.stringify(photos),
      );
    } catch (error) {
      await FileSystem.deleteAsync(newUri, { idempotent: true });
      newUri = null;
      throw error;
    }

    // Delete the previous app-managed image after replacement succeeds.
    if (oldUri && isManagedPhoto(oldUri, directory)) {
      await FileSystem.deleteAsync(oldUri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error saving product photo:', error);
    throw error;
  }
}

export async function removeProductPhoto(
  productId: number,
): Promise<void> {
  try {
    const directory = getPhotoDirectory();
    const photos = await getProductPhotos();
    const oldUri = photos[String(productId)];

    delete photos[String(productId)];

    await AsyncStorage.setItem(
      PRODUCT_PHOTOS_KEY,
      JSON.stringify(photos),
    );

    if (oldUri && isManagedPhoto(oldUri, directory)) {
      await FileSystem.deleteAsync(oldUri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error deleting product photo:', error);
    throw error;
  }
}
