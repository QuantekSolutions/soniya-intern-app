
import React, { useState } from 'react';

import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
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
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} />

      <Text style={styles.name}>{name}</Text>
      <Text style={styles.role}>{role}</Text>

      <Pressable
        style={styles.button}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.buttonText}>View Profile</Text>
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Image source={image} style={styles.modalImage} />

            <Text style={styles.name}>{name}</Text>
            <Text style={styles.role}>{role}</Text>

            <Text style={styles.heading}>About Me</Text>
            <Text style={styles.details}>
              Interested in software development and
              building mobile applications.
            </Text>

            <Text style={styles.heading}>Skills</Text>
            <Text style={styles.details}>
              Java • JavaScript • React Native
            </Text>

            <Pressable
              style={styles.button}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 22,
    margin: 20,
    alignItems: 'center',
    width: '88%',
    elevation: 4,
  },
  image: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  name: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#172554',
    marginTop: 12,
  },
  role: {
    fontSize: 16,
    color: '#2563eb',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 9,
    marginTop: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    width: '100%',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
  },
  modalImage: {
    width: 95,
    height: 95,
    borderRadius: 48,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#172554',
    marginTop: 22,
  },
  details: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});
