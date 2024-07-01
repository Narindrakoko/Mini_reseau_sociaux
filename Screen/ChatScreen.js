import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { auth, database } from '../firebaseConfig';
import { ref, push, onValue, get, set, child, update } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

const UserList = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const usersRef = ref(database, 'users');
    get(usersRef).then((snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const usersList = Object.entries(usersData).map(([key, value]) => ({
          id: key,
          name: value.displayName,
          photoURL: value.photoURL,
        }));
        setUsers(usersList);
      }
    });
  }, []);

  const handleUserSelect = (user) => {
    navigation.navigate('Chat', { user });
  };

  return (
    <View style={styles.container}>
      <View style={styles.userList}>
        <Text style={styles.title}>Choisir un destinataire :</Text>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userItem}
            onPress={() => handleUserSelect(user)}
          >
            <Image source={{ uri: user.photoURL }} style={styles.userAvatar} />
            <Text style={styles.username}>{user.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const ChatScreen = ({ navigation, route }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const currentUser = auth.currentUser;
  const selectedUser = route.params?.user;

  useEffect(() => {
    if (selectedUser) {
      const chatId = getChatId(currentUser.uid, selectedUser.id);
      const messagesRef = ref(database, `messages/${chatId}`);

      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.entries(data).map(([key, value]) => ({
            id: key,
            content: value.content,
            sender: value.sender,
            receiverId: value.receiverId,
            timestamp: value.timestamp,
            read: value.read,
          }));
          setMessages(messageList);

          // Marquer les messages comme lus pour l'utilisateur actuel
          messageList.forEach((message) => {
            if (message.receiverId === currentUser.uid && !message.read[currentUser.uid]) {
              const messageRef = child(messagesRef, message.id);
              update(messageRef, {
                [`read/${currentUser.uid}`]: true,
              });
            }
          });
        } else {
          setMessages([]);
        }
      });

      return () => unsubscribe();
    }
  }, [selectedUser, currentUser]);

  const sendMessage = () => {
    if (message.trim() && selectedUser) {
      const chatId = getChatId(currentUser.uid, selectedUser.id);
      const newMessageRef = push(ref(database, `messages/${chatId}`));
      const newMessageData = {
        content: message,
        sender: currentUser.uid,
        receiverId: selectedUser.id,
        timestamp: Date.now(),
        read: {
          [currentUser.uid]: true,
          [selectedUser.id]: false,
        },
      };
      set(newMessageRef, newMessageData);
  
      // Stocker une copie du message envoyé pour l'utilisateur actuel
      const userMessageRef = ref(database, `userMessages/${currentUser.uid}`);
      set(userMessageRef, newMessageData);
  
      setMessage('');
    }
  };
  

  const getChatId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('-');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Image source={{ uri: selectedUser?.photoURL }} style={styles.userAvatar} />
        <Text style={styles.username}>{selectedUser?.name}</Text>
      </View>
      <View style={styles.chatContainer}>
        {messages.length === 0 ? (
          <Text style={styles.noMessageText}>Aucun message pour l'instant</Text>
        ) : (
          <FlatList
  data={messages}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === currentUser.uid ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      {item.sender === currentUser.uid && (
        <Text style={styles.senderIndicator}>vous</Text>
      )}
    </View>
  )}
  contentContainerStyle={styles.messageList}
  inverted
/>

        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Entrez votre message"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  userList: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#fff',
    elevation: 2,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  messageList: {
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  sentMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#fff',
  },
  messageText: {
    color: '#333',
  },
  noMessageText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f2f2f2',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#075e54',
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  senderIndicator: {
    fontSize: 12,
    color: 'gray',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
});

export default ChatScreen;
