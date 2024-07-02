import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { auth, database } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';

const CreatePostButton = () => {
  const navigation = useNavigation();
  const currentUser = auth.currentUser;
  const [userPhotoURL, setUserPhotoURL] = useState(null);

  useEffect(() => {
    const userRef = ref(database, `users/${currentUser.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData && userData.photoURL) {
        setUserPhotoURL(userData.photoURL);
      } else {
        setUserPhotoURL(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleCreatePost}>
        <Icon name="add-circle" size={60} color="#075E54" />
        <Text style={styles.indicatorText}>Faire une publication</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 540,
    right: 20,
    alignItems: 'center',
  },
  button: {
    alignItems: 'center',
  },
  indicatorText: {
    color: '#075E54',
    fontSize: 12,
    marginTop: 4,
  },
});

export default CreatePostButton;
