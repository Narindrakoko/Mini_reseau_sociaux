import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('Auth'); // Navigate to the authentication screen
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section pour afficher le nom et la photo de profil */}
      <TouchableOpacity
        style={styles.profileSection}
        onPress={() => navigation.navigate('Profile')}
      >
        <Image
          source={{ uri: currentUser.photoURL }}
          style={styles.profileImage}
        />
        <Text style={styles.profileName}>{currentUser.displayName}</Text>
      </TouchableOpacity>

      {/* Autres boutons */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <FontAwesome name="home" size={24} color="#fff" />
        <Text style={styles.buttonText}>Accueil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('users')}>
        <FontAwesome name="comments" size={24} color="#fff" />
        <Text style={styles.buttonText}>Messages</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ChangePassword')}>
        <FontAwesome5 name="key" size={24} color="#fff" />
        <Text style={styles.buttonText}>Changer de mot de passe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleSignOut}>
        <FontAwesome name="sign-out" size={24} color="#fff" />
        <Text style={styles.buttonText}>Déconnexion</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECE5DD',
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#128C7E',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#128C7E', // WhatsApp green color
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    marginVertical: 10,
    width: '80%',
    justifyContent: 'center',
    elevation: 6, // Adds shadow for a more modern effect
  },
  logoutButton: {
    backgroundColor: '#D32F2F', // Different color for the logout button
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 12,
  },
});

export default SettingsScreen;
