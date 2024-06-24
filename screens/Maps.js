import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/style'; // Assure-toi que ce fichier existe et est correctement configuré


const CustomCallout = ({ imageUri, title, description }) => (
  <View style={customStyles.calloutContainer}>
    <View style={customStyles.calloutInnerContainer}>
      <Image source={{ uri: imageUri }} style={customStyles.calloutImage} />
    </View>
    <Text style={customStyles.calloutTitle}>{title}</Text>
    <Text style={customStyles.calloutDescription}>{description}</Text>
  </View>
);

const Maps = ({ navigation, route }) => {
  const [locations, setLocations] = useState([]);
  const mapViewRef = useRef(null);
  const markersRef = useRef([]);

  const initialRegion = {
    latitude: -21.4551,
    longitude: 47.0909,
    latitudeDelta: 0.019,
    longitudeDelta: 0.0054,
  };

  const [region, setRegion] = useState(initialRegion);

  useEffect(() => {
    const getStoredLocations = async () => {
      try {
        const storedUsers = await AsyncStorage.getItem('users');
        if (storedUsers) {
          const usersArray = JSON.parse(storedUsers);
          const retrievedLocations = usersArray.map((user, index) => ({
            key: index,
            latitude: user.location.latitude,
            longitude: user.location.longitude,
            title: `${user.nom} ${user.prenoms}`,
            description: `Agé de: ${user.age} ans,\nFonction: ${user.fonction}\nAdresse email: ${user.email}`,
            image: user.image,
          }));
          setLocations(retrievedLocations);

          if (route.params?.user) {
            const { location } = route.params.user;
            const selectedRegion = {
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.00254,
              longitudeDelta: 0.000254,
            };
            setRegion(selectedRegion);

            const markerIndex = usersArray.findIndex(user => user.nom === route.params.user.nom && user.prenoms === route.params.user.prenoms);
            setTimeout(() => {
              mapViewRef.current.animateToRegion(selectedRegion, 1000);
              if (markersRef.current[markerIndex]) {
                markersRef.current[markerIndex].showCallout();
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error retrieving locations from AsyncStorage:', error);
      }
    };

    getStoredLocations();
  }, [route.params?.user]);

  return (
    <View style={styles.containerMap}>
      <MapView ref={mapViewRef} style={styles.map} initialRegion={region}>
        {locations.map((location, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            ref={el => markersRef.current[index] = el}
          >
            <View style={customStyles.markerContainer}>
              <View style={customStyles.markerCircle}></View>
              <Image source={{ uri: location.image }} style={customStyles.markerImage} />
            </View>
            <Callout>
              <CustomCallout
                imageUri={location.image}
                title={location.title}
                description={location.description}
              />
            </Callout>
          </Marker>
        ))}
      </MapView>
      <Text style={styles.text}>
        {locations.length === 0 ? 'Aucune donnée de localisation trouvée' : 'Utilisateurs enregistrés'}
      </Text>
      <TouchableOpacity
        style={[styles.btnMap, styles.btnGreen]}
        onPress={() => navigation.navigate('Ajouter')}
      >
        <Text style={styles.btnTextWhite}>Ajouter</Text>
      </TouchableOpacity>
    </View>
  );
};

const customStyles = StyleSheet.create({
  calloutContainer: {
    width: 130,
    alignItems: 'center',
    borderRadius: 100, // Rendre l'image ronde
  },
  calloutInnerContainer: {
    backgroundColor: 'white',
    borderRadius: 100,
    padding: 2,
  },
  calloutImage: {
    width: 126,
    height: 126,
    borderRadius: 63, // Rendre l'image ronde
    marginBottom: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  calloutDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerImage: {
    width: 35,
    height: 35,
    borderRadius: 20, // Rendre l'image ronde
  },
  markerCircle: {
    width: 40,
    height: 40,
    borderTopLeftRadius: 250,
    borderBottomLeftRadius: 250,
    borderTopRightRadius: 250,
    backgroundColor: 'rgba(20,180,20,0.5)',
    position: 'absolute',
    bottom: -2.5,
    transform: [{ rotate: '45deg' }], // pour inverser la goutte
    borderColor: '#080',
    borderWidth: 0.2,
  },
});

export default Maps;
