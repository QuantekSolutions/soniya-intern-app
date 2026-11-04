
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView>
        <Text style={styles.heading}>PLAYGROUND</Text>

        {/* Column Layout */}
        <Text style={styles.subheading}>Three Coloured Boxes - Column Layout
        </Text>

        <View style={styles.boxContainer}>
          <View style={[styles.box, styles.redBox]}>
            <Text style={styles.boxText}>Box 1</Text>
          </View>

          <View style={[styles.box, styles.blueBox]}>
            <Text style={styles.boxText}>Box 2</Text>
          </View>

          <View style={[styles.box, styles.greenBox]}>
            <Text style={styles.boxText}>Box 3</Text>
          </View>
        </View>

        {/* Platform Information */}
        <Text style={styles.subheading}>Platform Info </Text>

        <Text style={styles.platformText}>Running on: {Platform.OS === 'android' ? 'Android' : 'iOS'}</Text>

        {/* ScrollView Practice */}
        <Text style={styles.subheading}>ScrollView Practice</Text>

        {Array.from({ length: 20 }, (_, index) => (
          <Text key={index} style={styles.listItem}>
            Item {index + 1}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#010d10',
    textDecorationColor: '#4b79ba',
    marginTop: 35,
    marginBottom: 10,
    letterSpacing: 2,
  },

  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
    marginTop: 25,
    marginBottom: 15,
  },

//  Column Layout
  boxContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: 10,
  },

//   // Row Layout
// boxContainer: {
//   flexDirection: 'row',
//   justifyContent: 'center',
//   alignItems: 'center',
//   gap: 10,
//   padding: 10,
// },

// 
// justifyContent: center
// boxContainer: {
//   flexDirection: 'row',
//   justifyContent: 'center',
//   alignItems: 'center',
//   gap: 10,
//   padding: 10,
// },

// //justifyContent: space-between
// boxContainer: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   gap: 8,
//   padding: 10,
// },

// AlignItems: center
// boxContainer: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   gap: 8,
//   padding: 10,
// },

// //AlignItems: stretch
// boxContainer: {
//   flexDirection: 'row',
//   justifyContent: 'space-between',
//   alignItems: 'stretch',
//   height: 150,
//   gap: 8,
//   padding: 10,
// },

  box: {
    width:110,
   //width: 200,
   //width:120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  redBox: {
    backgroundColor: 'tomato',
  },

  blueBox: {
    backgroundColor: 'skyblue',
  },

  greenBox: {
    backgroundColor: 'lightgreen',
  },

  boxText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Platform Information
  platformText: {
    fontSize: 16,
    marginHorizontal: 15,
  },

  // ScrollView Items
  listItem: {
    backgroundColor: 'lightgray',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 8,
    fontSize: 16,
  },
});
