import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import AuthScreen from './Authentification/AuthScreen';
import ProfileScreen from './Screen/ProfileScreen';
import CreatePostScreen from './Screen/CreatePostScreen';
import FeedScreen from './Screen/FeedScreen';
import HomeScreen from './Screen/HomeScreen';
import RegisterScreen from './Screen/RegisterScreen';
import ChatScreen from './Screen/ChatScreen';
import NotificationsScreen from './Screen/NotificationsScreen';
import UserList from './Screen/UserListScreen';
import NavigationBar from './components/NavigationBar';
import SettingsScreen from './Screen/SettingsScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isAuthScreen, setIsAuthScreen] = useState(true);
  const navigationRef = useRef(null);

  useEffect(() => {
    const unsubscribe = navigationRef.current?.addListener('state', () => {
      const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
      setIsAuthScreen(currentRoute === 'Auth');
    });

    return unsubscribe;
  }, [navigationRef]);

  const screenOptions = {
    headerShown: false, // Hide the default header
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>I-Resaka</Text>
        </View>
        {!isAuthScreen && <NavigationBar />}
        <View style={[styles.navigatorContainer, !isAuthScreen && styles.navigatorWithNavbar]}>
          <Stack.Navigator initialRouteName="Auth" screenOptions={screenOptions}>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="users" component={UserList} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Message" component={ChatScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
          </Stack.Navigator>
        </View>
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECE5DD', 
  },
  header: {
    height: 90,
    backgroundColor: '#075E54', 
    justifyContent: 'center',
    paddingHorizontal: 15,
    elevation: 3, // Add shadow for Android
    shadowColor: '#000', // Add shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerText: {
    fontSize: 28, // Larger font size
   // Using a common font
    color: '#fff',
    fontWeight: 'bold',
    top:20,
  },
  navigatorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  navigatorWithNavbar: {
    marginTop: -70, 
  },
});

export default App;
