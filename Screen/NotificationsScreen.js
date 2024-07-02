import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
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

  const renderNotification = ({ item }) => (
    <View style={styles.notification}>
      <Image source={{ uri: item.userPhotoURL }} style={styles.notificationImage} />
      <View style={styles.notificationTextContainer}>
        <Text style={styles.notificationText}>
          {item.type === 'like' ? `${item.username} liked your post` : `${item.username} commented: ${item.comment}`}
        </Text>
        <Text style={styles.notificationTimestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      renderItem={renderNotification}
    />
  );
};

const styles = StyleSheet.create({
  notification: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
});

export default NotificationsScreen;
