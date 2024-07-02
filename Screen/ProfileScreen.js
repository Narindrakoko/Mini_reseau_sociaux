import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, onValue, update, set } from 'firebase/database';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

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
                <Ionicons name="camera" size={24} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.username}>{name}</Text>
          </View>

         
          <View style={styles.infoSection}>
          <View style={styles.infoRow}>
              <MaterialIcons name="account-circle" size={24} color="#075e54" />
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={username}
                onChangeText={setUsername}
              />
              <Text style={styles.indicator}>Name</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="person-outline" size={24} color="#075e54" />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />
              <Text style={styles.indicator}>Last Name</Text>
            </View>


            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={24} color="#075e54" />
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
               <Text style={styles.indicator}>UserName</Text>
            </View>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="cake" size={24} color="#075e54" />
              <TextInput
                style={styles.input}
                placeholder="Birthday (YYYY-MM-DD)"
                value={birthday}
                onChangeText={setBirthday}
              />
              <Text style={styles.indicator}>Birthday</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={24} color="#075e54" />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />
              <Text style={styles.indicator}>Phone</Text>
            </View>
           
          </View>
          <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.message}>User is not authenticated.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#075e54',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#075e54',
    borderRadius: 20,
    padding: 5,
  },
  username: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#075e54',
  },
  infoSection: {
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
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
    color: '#075e54',
  },
  indicator: {
    marginLeft: 10,
    fontSize: 16,
    color: '#075e54',
    opacity: 0.6,
  },
  button: {
    backgroundColor: '#075e54',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    color: '#075e54',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ProfileScreen;
