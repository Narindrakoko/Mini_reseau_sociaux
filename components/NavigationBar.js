import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';

const NavigationBar = () => {
  const navigation = useNavigation();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [lastSentMessage, setLastSentMessage] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    const messagesRef = ref(database, 'messages');
    const userMessageRef = ref(database, `userMessages/${currentUser.uid}`);

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

    return () => {
      unsubscribeMessages();
      unsubscribeUserMessage();
    };
  }, [currentUser]);

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Icon name="account-circle" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('users')}>
        <Icon
          name="chat"
          size={24}
          color="white"
          badge={unreadMessagesCount > 0}
          badgeCount={unreadMessagesCount}
        />
        {lastSentMessage && (
          <Text style={styles.lastSentMessageText}>{lastSentMessage}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
        <Icon name="bell" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#075E54', // Couleur verte de WhatsApp
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
