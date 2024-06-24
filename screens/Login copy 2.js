import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, Animated, Alert } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/style';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [emailBorderColor, setEmailBorderColor] = useState('#ccc');
  const [passwordBorderColor, setPasswordBorderColor] = useState('#ccc');
  const [emailBackgroundColor, setEmailBackgroundColor] = useState('#fff');
  const [passwordBackgroundColor, setPasswordBackgroundColor] = useState('#fff');
  const alertPosition = useRef(new Animated.Value(-100)).current;

  const handleLogin = async () => {
    console.log('Entré de l utilisateur:', { email, password });

    try {
      const storedUsers = await AsyncStorage.getItem('users');
      const usersArray = storedUsers ? JSON.parse(storedUsers) : [];

      const user = usersArray.find(user => user.email === email && user.password === password);

      if (user) {
        navigation.navigate('Home');
      } else {
        showAlertMessage('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      showAlertMessage('Erreur serveur');
    }
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setEmailBorderColor('#f00');
    setPasswordBorderColor('#f00');
    setEmailBackgroundColor('#fdd');
    setPasswordBackgroundColor('#fdd');
    Animated.sequence([
      Animated.timing(alertPosition, {
        toValue: 50,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(alertPosition, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setShowAlert(false);
      setEmailBorderColor('#ccc');
      setPasswordBorderColor('#ccc');
      setEmailBackgroundColor('#fff');
      setPasswordBackgroundColor('#fff');
    });
  };

  return (
    <ImageBackground source={require('../assets/6.jpg')} style={styles.backgroundImage}>
      
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={[styles.input, { borderColor: emailBorderColor }, { backgroundColor: emailBackgroundColor }]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { borderColor: passwordBorderColor }, { backgroundColor: passwordBackgroundColor }]}
          placeholder="Mot de Passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={handleLogin}>
          <FontAwesomeIcon name="check" size={20} color="#fff" />
          <Text style={styles.btnTextWhite}> Valider</Text>
        </TouchableOpacity>
        
        {showAlert && (
          <Animated.View style={[styles.alertRed, { transform: [{ translateY: alertPosition }] }]}>
            <Text style={styles.alertText}>{alertMessage}</Text>
          </Animated.View>
        )}
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;
