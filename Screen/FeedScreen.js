// FeedScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { firebase } from '../firebaseConfig';

const FeedScreen = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const postRef = firebase.database().ref('posts');
    const handleData = snap => {
      if (snap.val()) {
        const postsData = Object.keys(snap.val()).map(key => ({
          id: key,
          ...snap.val()[key],
        }));
        setPosts(postsData);
      }
    };
    postRef.on('value', handleData);
    return () => postRef.off('value', handleData);
  }, []);

  return (
    <View>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default FeedScreen;
