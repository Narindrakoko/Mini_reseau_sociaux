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
        {userPhotoURL ? (
          <Image source={{ uri: userPhotoURL }} style={styles.profilePicture} />
        ) : (
          <Image
            source={require('../assets/2.jpg')}
            style={styles.profilePicture}
          />
        )}
        <Text style={styles.buttonText}>Faire une publication</Text>
        <Icon name="camera-alt" size={24} color="#000000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 555,
    right: 20,
    width: 300,
  },
  button: {
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'Black',
    fontSize: 14,
    marginTop: 2,
    marginHorizontal: 8,
    flex: 1,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
});

export default CreatePostButton;
