import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const handleAuth = () => {
    setIsLoading(true);
    const auth = getAuth();

    if (isLogin) {
      signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          console.log('Logged in:', userCredential.user);
          setIsLoading(false);
          navigation.navigate('Home');
        })
        .catch(error => {
          setIsLoading(false);
          setError('Error logging in: ' + error.message);
          console.error('Error logging in:', error);
        });
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          const user = userCredential.user;
          updateProfile(user, { displayName: username })
            .then(() => {
              console.log('Registered and profile updated:', user);
              setIsLoading(false);
              navigation.navigate('Home');
            })
            .catch(error => {
              setIsLoading(false);
              setError('Error updating profile: ' + error.message);
              console.error('Error updating profile:', error);
            });
        })
        .catch(error => {
          setIsLoading(false);
          setError('Error registering: ' + error.message);
          console.error('Error registering:', error);
        });
    }
  };

  const handlePasswordReset = () => {
    if (!email) {
      Alert.alert('Email Requise', 'Veillez entrer votre adresse email.');
      return;
    }

    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('Changement de Mot de passe', 'le lien de réinitialisation de mot de passe a été envoyé à votre adresse email.');
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <ImageBackground source={require('../assets/back1.jpeg')} style={styles.backgroundImage}>
      <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']} style={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <>
            <View style={styles.inputContainer}>
              {!isLogin && (
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={24} color="#fff" />
                  <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    style={styles.input}
                    placeholderTextColor="#fff"
                  />
                </View>
              )}
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={24} color="#fff" />
                <TextInput
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholderTextColor="#fff"
                />
              </View>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={24} color="#fff" />
                <TextInput
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  style={styles.input}
                  placeholderTextColor="#fff"
                />
              </View>

              {isLogin && (
              <TouchableOpacity onPress={handlePasswordReset}>
                <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            )}



            </View>


           
            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <Text style={styles.authButtonText}>{isLogin ? 'Connexion' : 'Enregistré'}</Text>
            </TouchableOpacity>
           
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleText}>
                {isLogin ? "Créer un compte" : 'Se connecté'}
              </Text>
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </>
        )}
      </LinearGradient>
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
    alignItems: 'center',
    padding: 16,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,

 
  },
  input: {
    flex: 1,
    color: '#fff',
    marginLeft: 8,
  },
  authButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginTop: 50,
    width: '80%',
      },
  authButtonText: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  toggleText: {
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  forgotPasswordText: {
    color: '#fff',
    marginTop: 8,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#ff3333',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default AuthScreen;
