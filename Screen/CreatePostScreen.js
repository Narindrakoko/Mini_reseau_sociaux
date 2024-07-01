import React, { useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, push, serverTimestamp } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { MaterialIcons } from '@expo/vector-icons';

const CreatePostScreen = ({ navigation }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRefInstance = storageRef(storage, `post_images/${user.uid}_${Date.now()}.jpg`);
    await uploadBytes(storageRefInstance, blob);
    return await getDownloadURL(storageRefInstance);
  };

  const handleSubmit = async () => {
    const db = getDatabase();
    const postsRef = ref(db, 'posts');
    let imageUrl = null;

    if (image) {
      imageUrl = await uploadImage(image);
    }

    const newPost = {
      text,
      createdAt: serverTimestamp(),
      username: user.displayName,
      userPhotoURL: user.photoURL,
      imageUrl: imageUrl || null,
    };

    await push(postsRef, newPost);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={text}
        onChangeText={setText}
      />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <MaterialIcons name="add-a-photo" size={24} color="gray" />
        <Text style={styles.imagePickerText}>Add Photo</Text>
      </TouchableOpacity>
      <Button title="Post" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  input: {
    height: 100,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 20,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePickerText: {
    marginLeft: 10,
    color: 'gray',
  },
});

export default CreatePostScreen;
