import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { auth, database } from '../firebaseConfig';
import { ref, get, child } from 'firebase/database';

const UserList = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
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
        setFilteredUsers(usersList);

        usersList.forEach((user) => {
          const chatId = getChatId(currentUser.uid, user.id);
          getLastMessage(chatId, user.id);
        });
      }
    });
  }, []);

  const getLastMessage = async (chatId, userId) => {
    const lastMessageRef = child(ref(database), `messages/${chatId}`);

    try {
      const snapshot = await get(lastMessageRef);
      const messages = snapshot.val() || {};
      const lastMessage = Object.values(messages).sort((a, b) => b.timestamp - a.timestamp)[0];

      if (lastMessage) {
        setLastMessages((prev) => ({
          ...prev,
          [userId]: lastMessage.content,
        }));
      } else {
        setLastMessages((prev) => ({
          ...prev,
          [userId]: 'Aucun message',
        }));
      }
    } catch (error) {
      console.error('Error fetching last message:', error);
      setLastMessages((prev) => ({
        ...prev,
        [userId]: 'Aucun message',
      }));
    }
  };

  const handleUserSelect = (user) => {
    navigation.navigate('Message', { user });
  };

  const getChatId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('-');
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un utilisateur"
        value={searchQuery}
        onChangeText={handleSearch}
        placeholderTextColor="#999"
      />
      <View style={styles.userList}>
        {filteredUsers.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userItem}
            onPress={() => handleUserSelect(user)}
          >
            <Image source={{ uri: user.photoURL }} style={styles.userAvatar} />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{user.name}</Text>
              <Text style={styles.lastMessage}>
                {lastMessages[user.id] || 'Aucun message'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginVertical: 10,
    marginHorizontal: 15,
    backgroundColor: '#fff',
  },
  userList: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
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
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
  },
  lastMessage: {
    color: '#666',
    fontSize: 14,
  },
});

export default UserList;
