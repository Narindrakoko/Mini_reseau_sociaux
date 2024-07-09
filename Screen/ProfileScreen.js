import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, StyleSheet, Modal, Alert } from 'react-native';
import { getAuth, signOut, updateProfile } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, onValue, update, set, push, serverTimestamp, remove } from 'firebase/database';
import { MaterialIcons, Ionicons, Entypo } from '@expo/vector-icons';

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
  const [profilePhotos, setProfilePhotos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [openMenus, setOpenMenus] = useState([]);
  const menuRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const userRef = dbRef(db, `users/${user.uid}`);

      // Écouteur pour les données de l'utilisateur
      const unsubscribeUserListener = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setLastName(data.lastName || '');
          setBirthday(data.birthday || '');
          setPhoneNumber(data.phoneNumber || '');
          setUsername(data.username || '');
        }
      }, (error) => {
        console.error('Error fetching user data:', error);
      });

      // Écouteur pour les publications de l'utilisateur
      const unsubscribePostsListener = onValue(dbRef(db, 'posts'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const userPosts = Object.entries(data)
            .map(([key, value]) => ({ id: key, ...value }))
            .filter(post => post.userId === user.uid);
          setPosts(userPosts);
          setPhotoAlbum(userPosts.filter(post => post.imageUrl && post.type !== 'profile'));
          setProfilePhotos(userPosts.filter(post => post.type === 'profile'));
        }
      }, (error) => {
        console.error('Error fetching user posts:', error);
      });

      // Nettoyage des écouteurs lors du démontage du composant
      return () => {
        unsubscribeUserListener();
        unsubscribePostsListener();
      };
    }
  }, [user]);

  const handleSignOut = useCallback(() => {
    signOut(auth)
      .then(() => {
        navigation.replace('Auth');
      })
      .catch(error => {
        console.error('Error signing out:', error);
      });
  }, [auth, navigation]);

  const pickImage = useCallback(async () => {
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
  }, [user]);

  const uploadImage = useCallback(async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const storageRefInstance = ref(storage, `profile_images/${user.uid}_${Date.now()}.jpg`);
      await uploadBytes(storageRefInstance, blob);
      const downloadURL = await getDownloadURL(storageRefInstance);
      setProfileImage(downloadURL);
      await updateProfileImage(downloadURL);
      await createProfilePhotoPost(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error.message, error);
    }
  }, [user]);

  const updateProfileImage = useCallback(async (downloadURL) => {
    if (user) {
      try {
        await updateProfile(user, { photoURL: downloadURL });
        const db = getDatabase();
        const userRef = dbRef(db, `users/${user.uid}`);
        await update(userRef, { photoURL: downloadURL });

        // Mettre à jour la photo de profil dans les posts existants
        const postsRef = dbRef(db, 'posts');
        onValue(postsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const updates = {};
            Object.keys(data).forEach((key) => {
              if (data[key].userId === user.uid) {
                updates[`/posts/${key}/userPhotoURL`] = downloadURL;
              }
            });
            update(db, updates);
          }
        });
      } catch (error) {
        console.error('Error updating profile image:', error);
      }
    } else {
      console.error('User is not authenticated.');
    }
  }, [user]);

  const createProfilePhotoPost = useCallback(async (downloadURL) => {
    if (user) {
      try {
        const db = getDatabase();
        const postsRef = dbRef(db, 'posts');
        const newPostRef = push(postsRef);
        await set(newPostRef, {
          userId: user.uid,
          username: user.displayName,
          userPhotoURL: user.photoURL,
          imageUrl: downloadURL,
          type: 'profile',
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error creating profile photo post:', error);
      }
    } else {
      console.error('User is not authenticated.');
    }
  }, [user]);

  const handleUpdateProfile = useCallback(async () => {
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
  }, [user, name, lastName, birthday, phoneNumber, username]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderProfileSection = useCallback(() => (
    <View style={styles.profileSection}>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={
            profileImage
              ? { uri: profileImage }
              : require('../assets/1.jpg')
          }
          style={styles.profileImage}
        />
        <View style={styles.cameraIcon}>
          <Ionicons name="camera" size={24} color="white" />
        </View>
      </TouchableOpacity>
      <Text style={styles.username}>{name}</Text>
    </View>
  ), [pickImage, profileImage, name]);

  const renderInfoSection = useCallback(() => (
    <View style={styles.infoSection}>
      {isEditing ? (
        <>
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
            <Text style={styles.indicator}>Phone Number</Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.infoRow}>
            <MaterialIcons name="account-circle" size={24} color="#075e54" />
            <Text style={styles.infoText}>{username}</Text>
            <Text style={styles.indicator}>Nom</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="person-outline" size={24} color="#075e54" />
            <Text style={styles.infoText}>{lastName}</Text>
            <Text style={styles.indicator}>Prénom</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={24} color="#075e54" />
            <Text style={styles.infoText}>{name}</Text>
            <Text style={styles.indicator}>Nom d'utilisateur</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="cake" size={24} color="#075e54" />
            <Text style={styles.infoText}>{birthday}</Text>
            <Text style={styles.indicator}>Date de naissance</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={24} color="#075e54" />
            <Text style={styles.infoText}>{phoneNumber}</Text>
            <Text style={styles.indicator}>Numero</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.editButtonText}>Modifier le profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  ), [isEditing, username, lastName, name, birthday, phoneNumber, handleUpdateProfile]);

  const renderPost = useCallback(({ item }) => {
    const handleDeletePost = async () => {
      Alert.alert(
        'Supprimer la publication',
        'Êtes-vous sûr de vouloir supprimer cette publication ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: () => deletePost(item.id) },
        ]
      );
    };

    const deletePost = async (postId) => {
      try {
        const db = getDatabase();
        const postRef = dbRef(db, `posts/${postId}`);
        await remove(postRef);
        setPosts(posts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    };

    const toggleMenu = (postId) => {
      setOpenMenus(openMenus.includes(postId) ? openMenus.filter(id => id !== postId) : [...openMenus, postId]);
    };

    return (
      <View style={styles.post}>
        <Text style={styles.postText}>{item.text || 'Aucune description'}</Text>
        {item.imageUrl && (
          <TouchableOpacity onPress={() => {
            setModalVisible(true);
            setModalImage(item.imageUrl);
          }}>
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
          </TouchableOpacity>
        )}
        <Text style={styles.postDate}>{item.createdAt ? formatDate(item.createdAt) : 'Date inconnue'}</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => toggleMenu(item.id)}
          ref={menuRef}
        >
          <Entypo name="dots-three-vertical" size={20} color="#075e54" />
        </TouchableOpacity>
        {openMenus.includes(item.id) && (
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleDeletePost}>
              <Text style={styles.menuItemText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }, [openMenus, formatDate]);

  const renderPhoto = useCallback(({ item }) => {
    const handleDeletePhoto = async () => {
      Alert.alert(
        'Supprimer la photo',
        'Êtes-vous sûr de vouloir supprimer cette photo ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: () => deletePhoto(item.id, item.type === 'profile') },
        ]
      );
    };

    const deletePhoto = async (photoId, isProfilePhoto) => {
      try {
        const db = getDatabase();
        const photoRef = dbRef(db, `posts/${photoId}`);
        await remove(photoRef);
        if (isProfilePhoto) {
          setProfilePhotos(profilePhotos.filter(photo => photo.id !== photoId));
        } else {
          setPhotoAlbum(photoAlbum.filter(photo => photo.id !== photoId));
        }
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    };

    const toggleMenu = (photoId) => {
      setOpenMenus(openMenus.includes(photoId) ? openMenus.filter(id => id !== photoId) : [...openMenus, photoId]);
    };
    
    return (
      <View style={styles.photoContainer}>
        <TouchableOpacity onPress={() => {
          setModalVisible(true);
          setModalImage(item.imageUrl);
        }}>
          <Image source={{ uri: item.imageUrl }} style={styles.albumImage} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => toggleMenu(item.id)}
          ref={menuRef}
        >
          <Entypo name="dots-three-vertical" size={20} color="#075e54" />
        </TouchableOpacity>
        {openMenus.includes(item.id) && (
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleDeletePhoto}>
              <Text style={styles.menuItemText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
    }, [openMenus]);
    
    return (
      <>
        <FlatList
          data={[
            { key: 'profile' },
            { key: 'info' },
            { key: 'album' },
            { key: 'profilePhotos' },
            { key: 'posts' }
          ]}
          renderItem={({ item }) => {
            switch (item.key) {
              case 'profile':
                return renderProfileSection();
              case 'info':
                return renderInfoSection();
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
                    <Text style={styles.sectionTitle}>Album photo</Text>
                    <FlatList
                      data={photoAlbum}
                      renderItem={renderPhoto}
                      keyExtractor={(item) => item.id}
                      horizontal
                      style={styles.flatList}
                    />
                  </>
                );
              case 'profilePhotos':
                return (
                  <>
                    <Text style={styles.sectionTitle}>Photos de profil</Text>
                    <FlatList
                      data={profilePhotos}
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
        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Image source={{ uri: modalImage }} style={styles.modalImage} />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      </>
    );
    };
    


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ccc',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  indicator: {
    marginLeft: 8,
    color: '#aaa',
    fontSize: 12,
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
    marginHorizontal: 1,
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
  postDate: {
    fontSize: 12,
    color: '#888',
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
  menuButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  menuContainer: {
    position: 'absolute',
    top: 40,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    zIndex: 1,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuItemText: {
    color: '#075e54',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  photoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#075e54',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#075e54',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ProfileScreen;
