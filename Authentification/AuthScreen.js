import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ImageBackground, ActivityIndicator } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // État de chargement

  const handleAuth = () => {
    setIsLoading(true); // Démarrer le chargement
    const auth = getAuth();

    if (isLogin) {
      signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          console.log('Logged in:', userCredential.user);
          setIsLoading(false); // Arrêter le chargement
          navigation.navigate('Home');
        })
        .catch(error => {
          setIsLoading(false); // Arrêter le chargement
          setError('Error logging in: ' + error.message);
          console.error('Error logging in:', error);
        });
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          const user = userCredential.user;

          updateProfile(user, {
            displayName: username,
          }).then(() => {
            console.log('Registered and profile updated:', user);
            setIsLoading(false); // Arrêter le chargement
            navigation.navigate('Home');
          }).catch(error => {
            setIsLoading(false); // Arrêter le chargement
            setError('Error updating profile: ' + error.message);
            console.error('Error updating profile:', error);
          });
        })
        .catch(error => {
          setIsLoading(false); // Arrêter le chargement
          setError('Error registering: ' + error.message);
          console.error('Error registering:', error);
        });
    }
  };

  return (
    <ImageBackground
      source={require('../assets/back.jpg')}
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
        style={styles.container}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#fff" /> // Afficher l'animation de chargement
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
            </View>
            <TouchableOpacity style={styles.authButton} onPress={handleAuth}>
              <Text style={styles.authButtonText}>{isLogin ? 'Login' : 'Register'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? Register" : 'Have an account? Login'}
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
  },
  authButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  toggleText: {
    color: '#fff',
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff3333',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default AuthScreen;
