// screens/HomeScreen.js
import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { NativeModules } from 'react-native';

const { CustomNativeModule } = NativeModules;

console.log('CustomNativeModule');


const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>

      <Button
        title="Go to Profile (with ID 123)"
        onPress={() => navigation.navigate('Profile', { userId: '123' })}
      />

      <View style={styles.space} />

      <Button
        title="Go to Profile (no ID)"
        onPress={() => { navigation.navigate('Profile'); console.log('CustomNativeModule'); }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  space: {
    height: 10,
  },
});

export default HomeScreen;