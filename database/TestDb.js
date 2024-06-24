import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const storedUsers = await readData('users');
      if (storedUsers) {
        setUsers(storedUsers);
      }
    };
    fetchData();
  }, []);

  const storeData = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      Alert.alert('Success', 'Users successfully saved');
    } catch (e) {
      Alert.alert('Error', 'Failed to save the data to the storage');
    }
  };

  const readData = async (key) => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch the data from storage');
    }
  };

  const handleAddUser = () => {
    if (!username || !age) {
      Alert.alert('Error', 'Please enter both username and age');
      return;
    }
    const newUser = { id: Date.now().toString(), username, age };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    storeData('users', updatedUsers);
    setUsername('');
    setAge('');
  };

  const handleUpdateUser = (id) => {
    const updatedUsers = users.map(user => 
      user.id === id ? { ...user, username, age } : user
    );
    setUsers(updatedUsers);
    storeData('users', updatedUsers);
  };

  const handleDeleteUser = (id) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    storeData('users', updatedUsers);
  };

  const renderUser = ({ item }) => (
    <View style={styles.userContainer}>
      <Text style={styles.userText}>Username: {item.username}</Text>
      <Text style={styles.userText}>Age: {item.age}</Text>
      <Button title="Edit" onPress={() => handleEdit(item.id)} />
      <Button title="Delete" onPress={() => handleDeleteUser(item.id)} />
    </View>
  );

  const handleEdit = (id) => {
    const user = users.find(user => user.id === id);
    if (user) {
      setUsername(user.username);
      setAge(user.age);
      handleDeleteUser(id);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>React Native AsyncStorage CRUD Example</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter age"
          value={age}
          onChangeText={setAge}
        />
        <Button title="Add User" onPress={handleAddUser} />
      </View>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={renderUser}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  userContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userText: {
    fontSize: 16,
  },
});

export default App;
