// DATA
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, ActivityIndicator, Alert, FlatList } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native-gesture-handler';

const Ajouter = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [age, setAge] = useState('');
    const [location, setLocation] = useState(null);
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    const getLocation = async () => {
        setLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setLoading(false);
            Alert.alert('Permission denied', 'Permission to access location was denied');
            return;
        }

        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
        setLocation(location.coords);
        setLoading(false);
    };

    const takePhoto = async () => {
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
            setImage(result.assets[0].uri);
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

    const storeData = async () => {
        if (!username || !age || !location || !image) {
            Alert.alert('Error', 'Please enter all data and take a photo');
            return;
        }

        try {
            const imageBase64 = await encodeImageToBase64(image);
            const userData = { username, age, location, image: imageBase64 };

            // Get existing users from AsyncStorage
            const storedUsers = await AsyncStorage.getItem('users');
            const usersArray = storedUsers ? JSON.parse(storedUsers) : [];

            // Add new user data
            usersArray.push(userData);

            // Store updated users array back in AsyncStorage
            await AsyncStorage.setItem('users', JSON.stringify(usersArray));

            // Update local state

            setUsername('');
            setAge('');
            setLocation(null);
            setImage(null);
            setLoading(false);
            setUsers([]);















            Alert.alert('Success', 'Users successfully saved');
        } catch (e) {
            Alert.alert('Error', 'Failed to save the data to storage');
        }
    };




    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Users Storage with Location and Photo</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter age"
                value={age}
                onChangeText={setAge}
            />
            <Button title="Get Current Location" onPress={getLocation} />
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {location && (
                <Text style={styles.location}>
                    Location: {location.latitude}, {location.longitude}
                </Text>
            )}
            <Button title="Take Photo" onPress={takePhoto} />
            {image && <Image source={{ uri: image }} style={styles.image} />}


            <Button title="Save Users" onPress={storeData} />



            <TouchableOpacity
                style={[styles.btn, styles.btnYellow]}
                onPress={() => navigation.navigate('Users')}
            >
                <Text style={styles.btnTextBlack}>Read Users</Text>
            </TouchableOpacity>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
    },
    location: {
        marginBottom: 10,
    },
    image: {
        width: 100,
        height: 100,
        margin: 10,
        borderRadius: 30,
    },
    storedDataContainer: {
        marginTop: 20,
    },
    storedDataTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    storedData: {
        fontSize: 16,
    },
});

export default Ajouter;
