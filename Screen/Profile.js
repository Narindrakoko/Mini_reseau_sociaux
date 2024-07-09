import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Modal, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref as dbRef, onValue } from 'firebase/database';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import ProfileScreen from './ProfileScreen';

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

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const userRef = dbRef(db, `users/${userId}`);

      const unsubscribeUserListener = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setProfileImage(data.photoURL || null);
          setName(data.displayName || '');
          setLastName(data.lastName || '');
          setBirthday(data.birthday || '');
          setPhoneNumber(data.phoneNumber || '');
          setUsername(data.username || '');
        }
      }, (error) => {
        console.error('Error fetching user data:', error);
      });

      const unsubscribePostsListener = onValue(dbRef(db, 'posts'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const userPosts = Object.entries(data)
            .map(([key, value]) => ({ id: key, ...value }))
            .filter(post => post.userId === userId);
          setPosts(userPosts);
          setPhotoAlbum(userPosts.filter(post => post.imageUrl && post.type !== 'profile'));
          setProfilePhotos(userPosts.filter(post => post.type === 'profile'));
        }
      }, (error) => {
        console.error('Error fetching user posts:', error);
      });

      return () => {
        unsubscribeUserListener();
        unsubscribePostsListener();
      };
    }
  }, [userId]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderProfileSection = useCallback(() => (
    <View style={styles.profileSection}>
      <Image
        source={
          profileImage
            ? { uri: profileImage }
            : require('../assets/1.jpg')
        }
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
    </View>
  ), [username, lastName, name, birthday, phoneNumber]);

  const renderPost = useCallback(({ item }) => (
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
         <Text style={styles.sectionTitle}>Tous ces publications</Text>

    </>
  ), [renderProfileSection, renderInfoSection,photoAlbum, profilePhotos, renderPhoto]);

  const renderListFooter = useCallback(() => (
    <>
     
   
    </>
  ), []);

  

  return (
    <>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
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
    marginVertical: 10,
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
    marginLeft: 10,
    fontSize: 16,
  },
  indicator: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#888',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    marginLeft: 20,
  },
  flatList: {
    paddingHorizontal: 20,
  },
  post: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
  },
  postText: {
    fontSize: 16,
    marginBottom: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 5,
  },
  postDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '70%',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 30,
    right: 30,
  },
});

export default ProfileScreen2;
