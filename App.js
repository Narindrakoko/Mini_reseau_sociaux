import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { getDatabase, ref, get } from 'firebase/database';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth } from 'firebase/auth';

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
import FriendRequestsScreen from './Screen/FriendRequestsScreen';

const Stack = createStackNavigator();

const App = () => {
  const [isAuthScreen, setIsAuthScreen] = useState(true);
  const navigationRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = navigationRef.current?.addListener('state', () => {
      const currentRoute = navigationRef.current?.getCurrentRoute()?.name;
      setIsAuthScreen(currentRoute === 'Auth');
    });

    return unsubscribe;
  }, [navigationRef]);

  useEffect(() => {
    if (currentUser) {
      const userRef = ref(getDatabase(), `users/${currentUser.uid}`);
      get(userRef).then((snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.photoURL) {
          setUserPhotoURL(userData.photoURL);
        } else {
          setUserPhotoURL(null);
        }
      });
    }
  }, [currentUser]);

  const screenOptions = {
    headerShown: false,
  };

  const handleProfilePress = () => {
    navigationRef.current?.navigate('Profile');
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>I-Resaka</Text>
          {!isAuthScreen && (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity
                style={styles.searchButtonContainer}
                onPress={() => navigationRef.current?.navigate('SearchResults')}
              >
                <Icon name="search" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleProfilePress}>
                {userPhotoURL ? (
                  <Image source={{ uri: userPhotoURL }} style={styles.userProfileImage} />
                ) : (
                  <Icon name="account-circle" size={30} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
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
            <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
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
  headerRightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButtonContainer: {
  
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  userProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 15,
    marginLeft: 5,
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
