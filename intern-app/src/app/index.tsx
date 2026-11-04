
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileCard from '@/components/ProfileCard';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ProfileCard
        name="Soniya Meena"
        role="Software Developer Intern"
        image={require('../../assets/images/Soniya_Meena.jpeg')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
});
