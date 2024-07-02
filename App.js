// App.js
/*import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './Authentification/AuthScreen';
import ProfileScreen from './Screen/ProfileScreen';
import CreatePostScreen from './Screen/CreatePostScreen';
import FeedScreen from './Screen/FeedScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="Feed" component={FeedScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App*/


// App.js

// App.js
import React, { useEffect, useState } from 'react';
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

// Initialize Firebase if not already initialized


const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
       <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="users" component={UserList} />
        <Stack.Screen name="Message" component={ChatScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />

      </Stack.Navigator>
      <NavigationBar />
    </NavigationContainer>
  );
};

export default App;
