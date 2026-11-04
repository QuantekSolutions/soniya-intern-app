
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@catalog_favorites';

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
    await AsyncStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(ids)
    );
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
}
