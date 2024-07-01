import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, onValue, update, set } from 'firebase/database';
import { MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [profileImage, setProfileImage] = useState(user ? user.photoURL : null);
  const [name, setName] = useState(user ? user.displayName : '');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const userRef = dbRef(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setLastName(data.lastName || '');
          setBirthday(data.birthday || '');
          setPhoneNumber(data.phoneNumber || '');
          setUsername(data.username || '');
        } else {
          set(userRef, {
            displayName: name,
            lastName,
            birthday,
            phoneNumber,
            username
          });
        }
      });
    }
  }, [user]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.replace('Auth');
      })
      .catch(error => {
        console.error('Error signing out:', error);
      });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && user) {
      const source = { uri: result.assets[0].uri };
      await uploadImage(source.uri);
    } else {
      console.error('User is not authenticated or image selection was canceled.');
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRef = ref(storage, `profile_images/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setProfileImage(downloadURL);
      await updateProfileImage(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error.message, error);
    }
  };

  const updateProfileImage = async (downloadURL) => {
    if (user) {
      try {
        await updateProfile(user, { photoURL: downloadURL });
        const db = getDatabase();
        const userRef = dbRef(db, `users/${user.uid}`);
        await update(userRef, { photoURL: downloadURL });
      } catch (error) {
        console.error('Error updating profile image:', error);
      }
    } else {
      console.error('User is not authenticated.');
    }
  };

  const handleUpdateProfile = async () => {
    if (user) {
      try {
        await updateProfile(user, {
          displayName: name,
          phoneNumber: phoneNumber
        });

        const db = getDatabase();
        const userRef = dbRef(db, `users/${user.uid}`);
        await update(userRef, {
          displayName: name,
          lastName,
          birthday,
          phoneNumber,
          username
        });
      } catch (error) {
        console.error('Error updating user information:', error);
      }
    } else {
      console.error('User is not authenticated.');
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <View style={styles.profileSection}>
            <TouchableOpacity onPress={pickImage}>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
              <View style={styles.cameraIcon}>
                <MaterialIcons name="camera-alt" size={24} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.verified}>{user.emailVerified ? 'Verified' : 'Not Verified'}</Text>
          </View>
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={24} color="gray" />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="person-outline" size={24} color="gray" />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="cake" size={24} color="gray" />
              <TextInput
                style={styles.input}
                placeholder="Birthday (YYYY-MM-DD)"
                value={birthday}
                onChangeText={setBirthday}
              />
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={24} color="gray" />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="account-circle" size={24} color="gray" />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>
          <Button title="Update Profile" onPress={handleUpdateProfile} />
          <Button title="Sign Out" onPress={handleSignOut} />
        </>
      ) : (
        <Text>User is not authenticated.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f4',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    padding: 5,
  },
  email: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  verified: {
    fontSize: 14,
    color: 'green',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
});

export default ProfileScreen;
