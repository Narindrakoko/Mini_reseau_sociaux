import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ActivityIndicator, Alert, FlatList, Modal, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/style';
import { ImageBackground } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import * as ImageManipulator from 'expo-image-manipulator';

const Users = ({ navigation }) => {
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
      Alert.alert('Permission refusée', 'La permission d\'accès à la localisation a été refusée');
      return;
    }

    let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    setter(location.coords);
    setLoading(false);
  };

  const takePhoto = async (setter) => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'La permission d\'accès à l\'appareil photo a été refusée');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 600 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );
      setter(manipResult.uri);
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
        Alert.alert('Oups !', 'Aucun données');
      }
    } catch (e) {
      Alert.alert('Oups !', 'Accès a la base de donneée interdit');
    }
  };

  const deleteData = async (matriculeToDelete) => {
    try {
      const storedUsers = await AsyncStorage.getItem('users');
      const usersArray = storedUsers ? JSON.parse(storedUsers) : [];
      const updatedUsers = usersArray.filter(user => user.matricule !== matriculeToDelete);
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      Alert.alert('Effacé !', 'Utilisateur effacé avec succes');
    } catch (e) {
      Alert.alert('Oups !', 'Interdiction de suppression');
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
      Alert.alert('Oups !', 'Veuillez completer tous les champs');
      return;
    }

    try {
      const storedUsers = await AsyncStorage.getItem('users');
      let usersArray = storedUsers ? JSON.parse(storedUsers) : [];

      // Check for duplicate matricule
      const duplicateUser = usersArray.find(user => user.matricule === editedMatricule && user.matricule !== selectedUser.matricule);
      if (duplicateUser) {
        Alert.alert('Oups !', 'Le matricule existe déjà');
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
      Alert.alert('Success', 'Utilisateur modifié');
    } catch (e) {
      Alert.alert('Oups !', 'Interdiction de la modification');
    }
  };

  readData();

  return (
    <ImageBackground source={require('../assets/4.jpg')} style={styles.backgroundImage}>
      <Text style={styles.title}>Les données enregistrées</Text>

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
                <Text style={styles.storedData}>Latitude : {item.location.latitude}</Text>
                <Text style={styles.storedData}>Longitude : {item.location.longitude}</Text>
              </>
            )}
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.buttonGroup} onPress={() => editData(item)}>
                <FontAwesomeIcon name="edit" size={34} color="#69F" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonGroup} onPress={() => deleteData(item.matricule)}>
                <FontAwesomeIcon name="remove" size={34} color="#f11" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonGroup} onPress={() => navigation.navigate('Maps', { user: item })}>
                <FontAwesomeIcon name="map-marker" size={34} color="#080" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <TextInput style={styles.inputUpdate} placeholder="Matricule" value={editedMatricule} onChangeText={setEditedMatricule} keyboardType="numeric" />
            <TextInput style={styles.inputUpdate} placeholder="Nom" value={editedNom} onChangeText={setEditedNom} />
            <TextInput style={styles.inputUpdate} placeholder="Prenoms" value={editedPrenoms} onChangeText={setEditedMPrenoms} />
            <TextInput style={styles.inputUpdate} placeholder="Age" value={editedAge} onChangeText={setEditedAge} keyboardType="numeric" />
            <TextInput style={styles.inputUpdate} placeholder="Fonction" value={editedFonction} onChangeText={setEditedFonction} />
            <TextInput style={styles.inputUpdate} placeholder="Email" value={editedEmail} onChangeText={setEditedEmail} />
            <TextInput style={styles.inputUpdate} placeholder="Mot de passe" value={editedPassword} onChangeText={setEditedPassword} />
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

export default Users;
