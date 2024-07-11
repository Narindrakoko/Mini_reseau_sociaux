import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref as dbRef, onValue, set, remove } from 'firebase/database';

const FriendRequestsScreen = () => {
  const [friendRequests, setFriendRequests] = useState([]);

  useEffect(() => {
    const currentUserId = getAuth().currentUser.uid;
    const db = getDatabase();
    const friendRequestsRef = dbRef(db, `friendRequests/${currentUserId}`);

    const unsubscribe = onValue(friendRequestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requests = Object.entries(data).map(([key, value]) => ({
          userId: key,
          ...value,
        }));
        setFriendRequests(requests);
      } else {
        setFriendRequests([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAcceptFriendRequest = (userId) => {
    const currentUserId = getAuth().currentUser.uid;
    const db = getDatabase();
    
    // Add friend in both users' friend lists
    set(dbRef(db, `friends/${currentUserId}/${userId}`), true);
    set(dbRef(db, `friends/${userId}/${currentUserId}`), true);

    // Remove friend request
    remove(dbRef(db, `friendRequests/${currentUserId}/${userId}`));
  };

  const handleDeleteFriendRequest = (userId) => {
    const currentUserId = getAuth().currentUser.uid;
    const db = getDatabase();
    remove(dbRef(db, `friendRequests/${currentUserId}/${userId}`));
  };

  const renderFriendRequest = ({ item }) => (
    <View style={styles.friendRequest}>
      <Image source={{ uri: item.photoURL }} style={styles.profileImage} />
      <Text style={styles.name}>{item.displayName}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptFriendRequest(item.userId)}
        >
          <Text style={styles.buttonText}>Accepter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteFriendRequest(item.userId)}
        >
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {friendRequests.length === 0 ? (
        <Text style={styles.noRequestsText}>Vous n'avez aucune demande d'ami pour le moment.</Text>
      ) : (
        <FlatList
          data={friendRequests}
          renderItem={renderFriendRequest}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  friendRequest: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: '#075e54',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  noRequestsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
  },
});

export default FriendRequestsScreen;
