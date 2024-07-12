import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Modal } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref as dbRef, onValue, set, remove } from 'firebase/database';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen2 = ({ navigation, route }) => {
  const { userId } = route.params;
  const [profileImage, setProfileImage] = useState(null);
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [posts, setPosts] = useState([]);
  const [photoAlbum, setPhotoAlbum] = useState([]);
  const [profilePhotos, setProfilePhotos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const userRef = dbRef(db, `users/${userId}`);

      const unsubscribeUserListener = onValue(
        userRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setProfileImage(data.photoURL || null);
            setName(data.displayName || '');
            setLastName(data.lastName || '');
            setBirthday(data.birthday || '');
            setPhoneNumber(data.phoneNumber || '');
            setUsername(data.username || '');
          }
        },
        (error) => {
          console.error('Error fetching user data:', error);
        }
      );

      const unsubscribePostsListener = onValue(
        dbRef(db, 'posts'),
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const userPosts = Object.entries(data)
              .map(([key, value]) => ({ id: key, ...value }))
              .filter((post) => post.userId === userId);
            setPosts(userPosts);
            setPhotoAlbum(userPosts.filter((post) => post.imageUrl && post.type !== 'profile'));
            setProfilePhotos(userPosts.filter((post) => post.type === 'profile'));
          }
        },
        (error) => {
          console.error('Error fetching user posts:', error);
        }
      );

      const currentUserId = getAuth().currentUser.uid;
      const friendRequestRef = dbRef(db, `friendRequests/${currentUserId}/${userId}`);

      const unsubscribeFriendRequestListener = onValue(friendRequestRef, (snapshot) => {
        setFriendRequestSent(snapshot.exists());
      });

      const friendsRef = dbRef(db, `friends/${currentUserId}/${userId}`);
      const unsubscribeFriendListener = onValue(friendsRef, (snapshot) => {
        setIsFriend(snapshot.exists());
      });

      return () => {
        unsubscribeUserListener();
        unsubscribePostsListener();
        unsubscribeFriendRequestListener();
        unsubscribeFriendListener();
      };
    }
  }, [userId]);

  const handleAddFriend = () => {
    const currentUserId = getAuth().currentUser.uid;
    const db = getDatabase();
    const friendRequestRef = dbRef(db, `friendRequests/${userId}/${currentUserId}`);

    set(friendRequestRef, {
      displayName: name,
      photoURL: profileImage,
      requestDate: new Date().toISOString(),
    });

    setFriendRequestSent(true);
  };

  const handleCancelFriendRequest = () => {
    const currentUserId = getAuth().currentUser.uid;
    const db = getDatabase();
    const friendRequestRef = dbRef(db, `friendRequests/${userId}/${currentUserId}`);

    remove(friendRequestRef);
    setFriendRequestSent(false);
  };

  const handleDeleteFriend = () => {
    const currentUserId = getAuth().currentUser.uid;
    const db = getDatabase();

    // Remove friends from both users' friend lists
    remove(dbRef(db, `friends/${currentUserId}/${userId}`));
    remove(dbRef(db, `friends/${userId}/${currentUserId}`));

    setIsFriend(false);
    setDropdownVisible(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderProfileSection = useCallback(() => (
    <View style={styles.profileSection}>
      <Image
        source={profileImage ? { uri: profileImage } : require('../assets/1.jpg')}
        style={styles.profileImage}
      />
      <Text style={styles.username}>{name}</Text>
    </View>
  ), [profileImage, name]);

  const renderInfoSection = useCallback(() => (
    <View style={styles.infoSection}>
      <View style={styles.infoRow}>
        <MaterialIcons name="account-circle" size={24} color="#075e54" />
        <Text style={styles.infoText}>{username}</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="person-outline" size={24} color="#075e54" />
        <Text style={styles.infoText}>{lastName}</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="person" size={24} color="#075e54" />
        <Text style={styles.infoText}>{name}</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="cake" size={24} color="#075e54" />
        <Text style={styles.infoText}>{birthday}</Text>
      </View>
      <View style={styles.infoRow}>
        <MaterialIcons name="phone" size={24} color="#075e54" />
        <Text style={styles.infoText}>{phoneNumber}</Text>
      </View>
      {!isFriend && (
        <TouchableOpacity
          style={styles.addFriendButton}
          onPress={friendRequestSent ? handleCancelFriendRequest : handleAddFriend}
        >
          <Text style={styles.addFriendButtonText}>
            {friendRequestSent ? 'Annuler la demande' : 'Ajouter comme ami'}
          </Text>
        </TouchableOpacity>
      )}
      {isFriend && (
        <View style={styles.friendButtons}>
          <View style={styles.dropdownButtonContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Text style={styles.dropdownButtonText}>Amis</Text>
            </TouchableOpacity>
            {dropdownVisible && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity style={styles.dropdownItem} onPress={handleDeleteFriend}>
                  <Text style={styles.dropdownItemText}>Supprimer l'ami</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  ), [username, lastName, name, birthday, phoneNumber, friendRequestSent, isFriend, dropdownVisible]);

  const renderPost = useCallback(({ item }) => (
    <View style={styles.post}>
      <Text style={styles.postText}>{item.text || 'Photo de profil'}</Text>
      {item.imageUrl && (
        <TouchableOpacity onPress={() => {
          setModalVisible(true);
          setModalImage(item.imageUrl);
        }}>
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        </TouchableOpacity>
      )}
      <Text style={styles.postDate}>{item.createdAt ? formatDate(item.createdAt) : 'Date inconnue'}</Text>
    </View>
  ), []);

  const renderPhoto = useCallback(({ item }) => (
    <View style={styles.photoContainer}>
      <TouchableOpacity onPress={() => {
        setModalVisible(true);
        setModalImage(item.imageUrl);
      }}>
        <Image source={{ uri: item.imageUrl }} style={styles.albumImage} />
      </TouchableOpacity>
    </View>
  ), []);

  const renderListHeader = useCallback(() => (
    <>
      {renderProfileSection()}
      {renderInfoSection()}
      <Text style={styles.sectionTitle}>Album photo</Text>
      <FlatList
        data={photoAlbum}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        horizontal
        style={styles.flatList}
      />
      <Text style={styles.sectionTitle}>Photos de profil</Text>
      <FlatList
        data={profilePhotos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        horizontal
        style={styles.flatList}
      />
      <Text style={styles.sectionTitle}>Tous ses publications</Text>
    </>
  ), [renderProfileSection, renderInfoSection, photoAlbum, profilePhotos, renderPhoto]);

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        style={styles.flatList}
      />
      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: modalImage }} style={styles.modalImage} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  infoSection: {
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
  },
  addFriendButton: {
    backgroundColor: '#075e54',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addFriendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  friendButtons: {
    marginTop: 10,
  },
  dropdownButtonContainer: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: '#075e54',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  flatList: {
    paddingHorizontal: 5,
  },
  post: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  postText: {
    fontSize: 16,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  postDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  photoContainer: {
    marginRight: 10,
  },
  albumImage: {
    width: 100,
    height: 100,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  modalImage: {
    width: '90%',
    height: '70%',
  },
});

export default ProfileScreen2;
