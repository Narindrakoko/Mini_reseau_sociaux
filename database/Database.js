import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ImageBackground } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import styles from '../styles/style';

const db = SQLite.openDatabase({ name: 'MyDatabase.db', location: 'default' });

const TestDb = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    createTable();
    fetchUsers();
  }, []);

  const createTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)',
        [],
        () => { console.log('Table created successfully'); },
        (_, error) => { console.log('Error creating table: ', error); }
      );
    });
  };

  const fetchUsers = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Users',
        [],
        (_, { rows }) => {
          const userData = [];
          for (let i = 0; i < rows.length; i++) {
            userData.push(rows.item(i));
          }
          setUsers(userData);
        },
        (_, error) => { console.log('Error fetching users:', error); }
      );
    });
  };

  const addUser = () => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO Users (name, email) VALUES (?, ?)',
        [name, email],
        () => { 
          console.log('User inserted:', { name, email });
          fetchUsers();
        },
        (_, error) => { 
          console.log('Error inserting user:', error);
        }
      );
    });
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
