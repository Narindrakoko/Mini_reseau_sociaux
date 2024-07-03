import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
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
  const [posts, setPosts] = useState([]);
  const [photoAlbum, setPhotoAlbum] = useState([]);

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

      const postsRef = dbRef(db, 'posts');
      onValue(postsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const userPosts = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
          })).filter(post => post.userId === user.uid);
          setPosts(userPosts);
          setPhotoAlbum(userPosts.filter(post => post.imageUrl));
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

  const renderProfileSection = () => (
    <View style={styles.profileSection}>
      <TouchableOpacity onPress={pickImage}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <View style={styles.cameraIcon}>
          <Ionicons name="camera" size={24} color="white" />
        </View>
      </TouchableOpacity>
      <Text style={styles.username}>{name}</Text>
    </View>
  );

  const renderInfoSection = () => (
    <View style={styles.infoSection}>
      <View style={styles.infoRow}>
        <MaterialIcons name="account-circle" size={24} color="#075e54" />
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <Text style={styles.indicator}>Username</Text>
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
        <Text style={styles.indicator}>Name</Text>
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
  );

  const renderButton = (title, onPress) => (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const renderPhoto = ({ item }) => (
    <Image source={{ uri: item.imageUrl }} style={styles.albumImage} />
  );



  const renderPost = ({ item }) => (
    <View style={styles.post}>
      <Text style={styles.postText}>{item.text}</Text>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
    </View>
  );

 
  return (
    <FlatList
      data={[{ key: 'profile' }, { key: 'info' }, { key: 'album' }, { key: 'posts' }]}
      renderItem={({ item }) => {
        switch (item.key) {
          case 'profile':
            return renderProfileSection();
          case 'info':
            return (
              <>
                {renderInfoSection()}
                {renderButton('Update Profile', handleUpdateProfile)}
              
              </>
            );
          case 'posts':
            return (
              <>
                <Text style={styles.sectionTitle}>Vos publications</Text>
                <FlatList
                  data={posts}
                  renderItem={renderPost}
                  keyExtractor={(item) => item.id}
                  horizontal={false}
                  style={styles.flatList}
                />
              </>
            );
          case 'album':
            return (
              <>
                <Text style={styles.sectionTitle}> Album photo</Text>
                <FlatList
                  data={photoAlbum}
                  renderItem={renderPhoto}
                  keyExtractor={(item) => item.id}
                  horizontal
                  style={styles.flatList}
                />
              </>
            );
          default:
            return null;
        }
      }}
      keyExtractor={(item) => item.key}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#075e54',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  post: {
    backgroundColor: 'white',
    padding: 15,
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
    marginHorizontal: 20,
  },
  postText: {
    fontSize: 16,
    color: '#075e54',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  albumImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    margin: 5,
  },
  flatList: {
    paddingHorizontal: 20,
  },
});

export default ProfileScreen;
