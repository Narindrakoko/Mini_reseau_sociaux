import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getDatabase, ref, get } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AuthScreen from './Authentification/AuthScreen';
import ProfileScreen from './Screen/ProfileScreen';
import CreatePostScreen from './Screen/CreatePostScreen';
import ProfileScreen2 from './Screen/Profile';
import HomeScreen from './Screen/HomeScreen';
import RegisterScreen from './Screen/RegisterScreen';
import ChatScreen from './Screen/ChatScreen';
import NotificationsScreen from './Screen/NotificationsScreen';
import UserList from './Screen/UserListScreen';
import NavigationBar from './components/NavigationBar';
import SettingsScreen from './Screen/SettingsScreen';
import ChangePasswordScreen from './Screen/ChangePasswordScreen';
import SearchResultsScreen from './Screen/SearchResultsScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isAuthScreen, setIsAuthScreen] = useState(true);
  const navigationRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const unsubscribe = navigationRef.current?.addListener('state', () => {
      const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
      setIsAuthScreen(currentRoute === 'Auth');
    });

    return unsubscribe;
  }, [navigationRef]);

  const screenOptions = {
    headerShown: false,
  };


  return (
    <NavigationContainer ref={navigationRef}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>I-Resaka</Text>
          
          {!isAuthScreen && (
            <TouchableOpacity
              style={styles.searchButtonContainer}
              onPress={() => navigationRef.current?.navigate('SearchResults')}
            >
               <Icon name="search" size={24} color="#fff" /> 
            </TouchableOpacity>
          )}
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
            <Stack.Screen name="Profile2" component={ProfileScreen2} />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  searchIconContainer: {
    padding: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginHorizontal: 10,
  },
  navigatorContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navigatorWithNavbar: {
    marginTop: -70, 
  },
  searchButtonContainer: {
    backgroundColor: '#128C7E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default App;
