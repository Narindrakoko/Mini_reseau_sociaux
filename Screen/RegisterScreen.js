// screens/RegisterScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    const auth = getAuth();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload profile picture to Firebase Storage
      if (profilePicture) {
        const storage = getStorage();
        const profilePictureRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadString(profilePictureRef, profilePicture, 'data_url');

        // Get download URL for profile picture
        const downloadURL = await getDownloadURL(profilePictureRef);
        // Update user profile with display name and photo URL
        await updateProfile(user, {
          displayName: displayName,
          photoURL: downloadURL,
        });
      } else {
        // Update user profile with display name
        await updateProfile(user, {
          displayName: displayName,
        });
      }

      console.log('User registered successfully:', user);
      // Optionally navigate to the next screen after successful registration
    } catch (error) {
      setError('Error registering user: ' + error.message);
      console.error('Error registering user:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Display Name"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <Button title="Choose Profile Picture" onPress={handleChooseProfilePicture} />
      {profilePicture && <Image source={{ uri: profilePicture }} style={styles.profilePicture} />}
      <Button title="Register" onPress={handleRegister} />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default RegisterScreen;
