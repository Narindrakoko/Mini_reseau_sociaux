import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ImageBackground, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../styles/style';

const iconsList = [
  'home', 'user', 'bell', 'cog', 'camera', 'heart', 'star', 'info-circle', 'check', 'times', 'plus', 'minus', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down'
];

const SecondScreen = ({ navigation }) => {
  const [showAlert, setShowAlert] = useState(true);
  const [users, setUsers] = useState([]);
  const alertPosition = useRef(new Animated.Value(-100)).current; // Initial position above the screen

  useEffect(() => {
    // Animation for dropping the alert
    Animated.sequence([
      Animated.timing(alertPosition, {
        toValue: 50, // Final position for the alert
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.delay(1000), // Delay for visibility
      // Animation for lifting the alert back up
      Animated.timing(alertPosition, {
        toValue: -100, // Initial position above the screen
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowAlert(false); // Hide alert after animation
    });

    // Fetch users when the component mounts
    
  }, [alertPosition]);

  
  

  const renderIcon = ({ item }) => (
    <View style={localStyles.iconContainer}>
      <FontAwesome name={item} size={30} color="#333" />
      <Text style={localStyles.iconName}>{item}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require('../assets/4.jpg')}
      style={styles.backgroundImage}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={20} color="#fff" />
      </TouchableOpacity>
      <View style={styles.container}>
        {showAlert && (
          <Animated.View style={[styles.alert, { transform: [{ translateY: alertPosition }] }]}>
            <Text style={styles.alertText}>Connexion réussie</Text>
          </Animated.View>
        )}
        <FontAwesome name="info-circle" size={80} color="#070" style={styles.icon} />
        <Text style={styles.title}>Bienvenue sur l'écran d'information</Text>
        <Text style={styles.description}>
          Vous trouverez ici des informations importantes sur notre application.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis auctor varius metus at gravida.
          Donec sit amet orci vel nibh fermentum fermentum. Donec euismod, elit ac eleifend tristique,
          tortor lorem fringilla nisi, vel tincidunt libero velit eget nulla. In vel velit id mauris vestibulum aliquet.
        </Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Informations supplémentaires :</Text>
          <Text style={styles.info}>- Dernière mise à jour : 5 juin 2024</Text>
          <Text style={styles.info}>- Version de l'application : 1.0.0</Text>
          <Text style={styles.info}>- Développeur : Nii Rakoto</Text>
        </View>
        
        <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnTextWhite}>Retour</Text>
        </TouchableOpacity>
        <FlatList
          data={iconsList}
          renderItem={renderIcon}
          keyExtractor={(item) => item}
          contentContainerStyle={localStyles.iconsList}
        />
      </View>
    </ImageBackground>
  );
};

const localStyles = StyleSheet.create({
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  iconName: {
    marginLeft: 10,
    fontSize: 16,
  },
  iconsList: {
    marginTop: 20,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  userName: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default SecondScreen;
