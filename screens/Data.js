import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ActivityIndicator, Alert, FlatList, Modal, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles2 from '../styles/style';
import { ImageBackground } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editedMatricule, setEditedMatricule] = useState('');
  const [editedNom, setEditedNom] = useState('');
  const [editedPrenoms, setEditedMPrenoms] = useState('');
  const [editedAge, setEditedAge] = useState('');
  const [editedFonction, setEditedFonction] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPassword, setEditedPassword] = useState('');
  const [editedLocation, setEditedLocation] = useState(null);
  const [editedImage, setEditedImage] = useState(null);

  const getLocation = async (setter) => {
    setLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLoading(false);
      Alert.alert('Permission denied', 'Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    setter(location.coords);
    setLoading(false);
  };

  const takePhoto = async (setter) => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Permission to access camera was denied');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const encodeImageToBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const readData = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      if (storedUsers !== null) {
        setUsers(JSON.parse(storedUsers));
      } else {
        Alert.alert('Error', 'No data found');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch the data from storage');
    }
  };

  const deleteData = async (matriculeToDelete) => {
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      const usersArray = storedUsers ? JSON.parse(storedUsers) : [];
      const updatedUsers = usersArray.filter(user => user.matricule !== matriculeToDelete);
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      Alert.alert('Success', 'Users successfully deleted');
    } catch (e) {
      Alert.alert('Error', 'Failed to delete the data from storage');
    }
  };

  const editData = (user) => {
    setSelectedUser(user);
    setEditedMatricule(user.matricule);
    setEditedNom(user.nom);
    setEditedMPrenoms(user.prenoms);
    setEditedAge(user.age);
    setEditedFonction(user.fonction);
    setEditedEmail(user.email);
    setEditedPassword(user.password);
    setEditedLocation(user.location);
    setEditedImage(user.image);
    setIsModalVisible(true);
  };

  const updateData = async () => {
    if (!editedMatricule || !editedNom || !editedPrenoms || !editedAge || !editedFonction || !editedEmail || !editedPassword || !editedLocation || !editedImage) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem('users');
      let usersArray = storedUsers ? JSON.parse(storedUsers) : [];

      // Check for duplicate matricule
      const duplicateUser = usersArray.find(user => user.matricule === editedMatricule && user.matricule !== selectedUser.matricule);
      if (duplicateUser) {
        Alert.alert('Error', 'Matricule already exists');
        return;
      }

      usersArray = usersArray.map(user =>
        user.matricule === selectedUser.matricule
          ? { ...user, matricule: editedMatricule, nom: editedNom, prenoms: editedPrenoms, age: editedAge, fonction: editedFonction, email: editedEmail, password: editedPassword, location: editedLocation, image: editedImage }
          : user
      );

      await AsyncStorage.setItem('users', JSON.stringify(usersArray));
      setUsers(usersArray);
      setIsModalVisible(false);
      Alert.alert('Success', 'Users successfully updated');
    } catch (e) {
      Alert.alert('Error', 'Failed to update the data');
    }
  };

  readData();

  return (
    <ImageBackground source={require('../assets/1.jpg')} style={styles.backgroundImage}>
      <Text style={styles.title}>User Users Storage with Location and Photo</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.matricule}
        renderItem={({ item }) => (
          <View style={styles.storedDataContainer}>

            {item.image && <Image source={{ uri: item.image }} style={styles.image} />}

            <Text style={styles.storedDataTitle}>{item.nom} {item.prenoms}</Text>
            <Text style={styles.storedDataTitle}>Agé de {item.age} ans</Text>
            <Text style={styles.storedDataTitle}>Fonction: {item.fonction}</Text>
            <Text style={styles.storedDataTitle}>Numéro matricule: {item.matricule}</Text>
            <Text style={styles.storedDataTitle}>Email: {item.email}</Text>
            {item.location && (
              <>
                <Text style={styles.storedData}>
                  Latitude : {item.location.latitude}
                </Text>
                <Text style={styles.storedData}>
                  Longitude : {item.location.longitude}
                </Text>
              </>
            )}
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={[styles.buttonGroup, styles.btnGreen]} onPress={() => editData(item)}>
                <FontAwesomeIcon name="edit" size={34} color="#00F" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttonGroup, styles.btnSecondary]} onPress={() => deleteData(item.matricule)}>
                <FontAwesomeIcon name="remove" size={34} color="#f00" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <TextInput
              style={styles.input}
              placeholder="Matricule"
              value={editedMatricule}
              onChangeText={setEditedMatricule}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={editedNom}
              onChangeText={setEditedNom}
            />
            <TextInput
              style={styles.input}
              placeholder="Prenoms"
              value={editedPrenoms}
              onChangeText={setEditedMPrenoms}
            />
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={editedAge}
              onChangeText={setEditedAge}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Fonction"
              value={editedFonction}
              onChangeText={setEditedFonction}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editedEmail}
              onChangeText={setEditedEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={editedPassword}
              onChangeText={setEditedPassword}
            />
            <View style={styles.buttonContainer}>
              <Button title="Edit Location" onPress={() => getLocation(setEditedLocation)} />
              <Button title="Edit Photo" onPress={() => takePhoto(setEditedImage)} />
            </View>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {editedImage && <Image source={{ uri: editedImage }} style={styles.image} />}
            <View style={styles.buttonGroup}>
              <Button style={styles.buttonChild} title="Update" onPress={updateData} />
              <Button style={styles.buttonChild} title="Cancel" onPress={() => setIsModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    margin: 10,
    borderRadius: 8,
  },
  storedDataContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(200,200,255,0.9)',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  storedDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  storedData: {
    fontSize: 16,
    color: '#666',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  buttonChild: {
    backgroundColor: 'rgba(0, 0, 150, 0.5)',
    color: '#F00',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});


export default Users;
