import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import styles from '../styles/style';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';


const HomeScreen = ({ navigation }) => (
  <ImageBackground source={require('../assets/4.jpg')} style={styles.backgroundImage}>
    <View style={styles.content}>
      <Text style={styles.title}>Tree Tracking</Text>
      <Text style={styles.subtitle}>Projet de Nii Rakoto</Text>
      <Text style={styles.description}>
        L'application de gestion de plantation et suivi des données avec tous les détails de ces plantations d'arbres.
      </Text>

      <TouchableOpacity style={[styles.btn, styles.btnYellow]} onPress={() => navigation.navigate('Ajouter')}>
        <Text style={styles.btnTextWhite}>Ajouter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={() => navigation.navigate('Users')}>
        <Text style={styles.btnTextWhite}>Utilisateurs</Text>
        <Text>Hello, Firebase Auth!</Text>
      </TouchableOpacity>


    </View>

    {/* Vue des boutons de navigation fixés en bas 
    <View style={styles.bottomBar}>
      <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Home')}>
      <FontAwesomeIcon name="home" size={53} color="#080" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Users')}>
      <FontAwesomeIcon name="user" size={40} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.bottomBarButton} onPress={() => navigation.navigate('Maps')}>
      <FontAwesomeIcon name="map" size={38} color="#000" />
      </TouchableOpacity>
    </View>
    */}
  </ImageBackground>
);

export default HomeScreen;
