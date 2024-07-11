import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from 'react-native-elements'; // Importation du composant Badge de react-native-elements

const NavigationBar = () => {
  const navigation = useNavigation();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [lastSentMessage, setLastSentMessage] = useState('');
  const [notificationsCount, setNotificationsCount] = useState(0); // État pour le nombre de notifications
  const currentUser = auth.currentUser;
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);

  useEffect(() => {
    const messagesRef = ref(database, 'messages');
    const userMessageRef = ref(database, `userMessages/${currentUser.uid}`);
    const notificationsRef = ref(database, `notifications/${currentUser.uid}`); // Référence pour les notifications

    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const messages = snapshot.val() || {};
      let unreadCount = 0;

      Object.values(messages).forEach((conversation) => {
        Object.values(conversation).forEach((message) => {
          if (
            message.receiverId === currentUser.uid &&
            !message.read[currentUser.uid]
          ) {
            unreadCount++;
          }
        });
      });

      setUnreadMessagesCount(unreadCount);
    });

    const unsubscribeUserMessage = onValue(userMessageRef, (snapshot) => {
      const lastMessage = snapshot.val();
      if (lastMessage) {
        setLastSentMessage(lastMessage.content);
      } else {
        setLastSentMessage('');
      }
    });

   

    const friendRequestsRef = ref(database, `friendRequests/${currentUser.uid}`);
    const unsubscribeFriendRequests = onValue(friendRequestsRef, (snapshot) => {
      const friendRequests = snapshot.val() || {};
      const friendRequestsCount = Object.keys(friendRequests).length;
      setFriendRequestsCount(friendRequestsCount);
    });

    const unsubscribeNotifications = onValue(notificationsRef, (snapshot) => {
      const notifications = snapshot.val() || {};
      const notificationsCount = Object.keys(notifications).length; // Calcul du nombre de notifications
      setNotificationsCount(notificationsCount);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeUserMessage();
      unsubscribeNotifications(); // Désabonnement des notifications
      unsubscribeFriendRequests();
    };


  }, [currentUser]);

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('FriendRequests')}>
  <Badge
    value={friendRequestsCount}
    status="error"
    containerStyle={{ position: 'absolute', top: -6, right: -10 }}
  />
  <Icon name="account-circle" size={24} color="white" />
</TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('users')}>
        <Badge
          value={unreadMessagesCount}
          status="error"
          containerStyle={{ position: 'absolute', top: -6, right: -10 }}
        />
        <Icon name="chat" size={24} color="white" />
        
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
        <Badge
          value={notificationsCount}
          status="error"
          containerStyle={{ position: 'absolute', top: -6, right: -10 }}
        />
        <Icon name="bell" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
      <Ionicons name="settings" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#075E54',
    padding: 10,
    marginBottom: 65,
  },
  lastSentMessageText: {
    color: 'white',
    fontSize: 12,
    marginTop: 2,
  },
});

export default NavigationBar;
