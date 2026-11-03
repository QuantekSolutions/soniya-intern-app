
import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  ImageSourcePropType,
} from 'react-native';

interface ProfileCardProps {
  name: string;
  role: string;
  image: ImageSourcePropType;
}

export default function ProfileCard({
  name,
  role,
  image,
}: ProfileCardProps) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} />

      <Text style={styles.name}>{name}</Text>

      <Text style={styles.role}>{role}</Text>

      <Pressable
        style={styles.button}
        onPress={() => Alert.alert('Hello ' + name)}
      >
        <Text style={styles.buttonText}>View Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },

  role: {
    fontSize: 16,
    marginTop: 5,
  },

  button: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
