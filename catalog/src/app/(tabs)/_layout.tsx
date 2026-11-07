
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Products',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="cube-outline"
              size={size}
              color={typeof color === 'string' ? color : '#6264e8'}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="heart-outline"
              size={size}
              color={typeof color === 'string' ? color : '#6264e8'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
