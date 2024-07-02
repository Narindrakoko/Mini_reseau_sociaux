import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const db = getDatabase();
    const postsRef = ref(db, 'posts');

    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      const notificationsArray = [];

      if (data) {
        Object.keys(data).forEach(postId => {
          const post = data[postId];
          const postOwnerId = post.userId;

          if (postOwnerId === user.uid) {
            if (post.likes) {
              Object.keys(post.likes).forEach(likeUserId => {
                const likeData = post.likes[likeUserId];
                notificationsArray.push({
                  id: `${postId}_like_${likeUserId}`,
                  type: 'like',
                  username: likeData.username,
                  userPhotoURL: likeData.userPhotoURL,
                  timestamp: likeData.timestamp,
                });
              });
            }

            if (post.comments) {
              Object.keys(post.comments).forEach(commentId => {
                const comment = post.comments[commentId];
                notificationsArray.push({
                  id: `${postId}_comment_${commentId}`,
                  type: 'comment',
                  username: comment.username,
                  comment: comment.text,
                  userPhotoURL: comment.userPhotoURL,
                  timestamp: comment.timestamp,
                });
              });
            }
          }
        });
      }

      setNotifications(notificationsArray);
    });
  }, [user.uid]);

  const handleNotificationSelect = (id) => {
    setSelectedNotifications((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((notificationId) => notificationId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDeleteNotifications = () => {
    // Supprimer les notifications sélectionnées de la base de données
    // Vous devrez implémenter la logique pour supprimer les notifications de la base de données
    setSelectedNotifications([]);
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notification,
        selectedNotifications.includes(item.id) && styles.selectedNotification,
      ]}
      onPress={() => handleNotificationSelect(item.id)}
    >
      <Image source={{ uri: item.userPhotoURL }} style={styles.notificationImage} />
      <View style={styles.notificationTextContainer}>
        <Text style={styles.notificationText}>
          {item.type === 'like' ? `${item.username} liked your post` : `${item.username} commented: ${item.comment}`}
        </Text>
        <Text style={styles.notificationTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
      />
      {selectedNotifications.length > 0 && (
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteNotifications}>
          <Text style={styles.deleteButtonText}>Supprimer les notifications sélectionnées</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notification: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedNotification: {
    backgroundColor: '#e0e0e0',
  },
  notificationImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: 'gray',
  },
  deleteButton: {
    backgroundColor: '#ff3333',
    padding: 15,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;
