import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import {ActivityIndicator} from 'react-native';

// Initialize the navigation stack
const Stack = createNativeStackNavigator();

// Deep linking configuration
const linking = {
  prefixes: ['countryexplorer://', 'https://countryexplorer.com'],
  config: {
    screens: {
      Home: 'home',
      Profile: {
        path: 'country/:countryCode',
        parse: {
          countryCode: (countryCode) => countryCode.toUpperCase(),
        },
        stringify: {
          countryCode: (countryCode) => countryCode.toLowerCase(),
        },
      },
    },
  },
};

// Apollo Client configuration
const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com/graphql',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ApolloProvider client={client}>
        <NavigationContainer 
          linking={linking}
          fallback={<ActivityIndicator style={styles.loader} size="large" />}
        >
          <Stack.Navigator 
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1e3c72',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              contentStyle: {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ 
                title: 'Country Explorer',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={({ route }) => ({ 
                title: route.params?.countryName || 'Country Details',
                headerBackTitle: 'Back',
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e3c72',
  },
});