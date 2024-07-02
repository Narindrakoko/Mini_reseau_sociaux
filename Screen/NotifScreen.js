import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';

const NotifScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      console.log('Current user:', user);

      const db = getDatabase();
      const notificationsRef = ref(db, `notifications/${user.uid}`);

      onValue(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        console.log('Notifications data:', data);
        const notificationsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
        setNotifications(notificationsArray);
      });
    } else {
      console.error('No user is logged in');
    }
  }, [user]);

  const renderNotification = ({ item }) => {
    return (
      <View style={styles.notification}>
        {item.userPhotoURL ? (
          <Image source={{ uri: item.userPhotoURL }} style={styles.profileImage} />
        ) : (
          <MaterialIcons name="person" size={40} color="gray" />
        )}
        <View style={styles.notificationTextContainer}>
          <Text style={styles.notificationText}>
            <Text style={styles.username}>{item.username}</Text>
            {item.type === 'like' ? ' liked your post.' : ` commented: ${item.comment}`}
          </Text>
          {item.postData && (
            <>
              <Text style={styles.postText}>{item.postData.text}</Text>
              {item.postData.imageUrl && (
                <Image source={{ uri: item.postData.imageUrl }} style={styles.postImage} />
              )}
            </>
          )}
          <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  notification: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  notificationTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
  },
  username: {
    fontWeight: 'bold',
  },
  postText: {
    fontSize: 14,
    marginTop: 5,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
});

export default NotifScreen;
