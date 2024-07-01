import React from 'react';
import { View, StyleSheet,Text } from 'react-native';
import NavigationBar from '../components/NavigationBar';
import Feed from '../components/Feed';
import CreatePostButton from '../components/CreatePostButton';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
    
      <NavigationBar />
      <Feed />
      <CreatePostButton />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;
