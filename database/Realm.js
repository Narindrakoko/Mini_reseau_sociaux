import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/style';

const TestDb = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await AsyncStorage.getItem('users');
      if (usersData !== null) {
        setUsers(JSON.parse(usersData));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const addUser = async () => {
    try {
      const newUser = { id: Date.now(), name, email };
      await AsyncStorage.setItem('user_' + newUser.id, JSON.stringify(newUser));
      setName('');
      setEmail('');
      setUsers([...users, newUser]);
    } catch (error) {
      console.error('Error inserting user:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/11.jpg')}
      style={styles.backgroundImage}
    >
      <View style={{ margin: 50 }}>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={{ borderBottomWidth: 1, marginBottom: 20 }}
        />
        <TouchableOpacity onPress={addUser} style={{ backgroundColor: 'blue', padding: 10, marginBottom: 20 }}>
          <Text style={{ color: 'white' }}>Add User</Text>
        </TouchableOpacity>



        <TouchableOpacity style={[styles.btn , styles.btnGreen]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnTextWhite}>Retour</Text>
        </TouchableOpacity>







        <FlatList
          data={users}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={{ padding: 10, borderBottomWidth: 1 }}>
              <Text>{item.name}</Text>
              <Text>{item.email}</Text>
            </View>
          )}
        />
      </View>
    </ImageBackground>
  );
};

export default TestDb;
