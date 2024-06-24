// App.js
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';

// Composant d'exemple pour le contenu du Drawer
function CustomDrawerContent(props) {
  const { navigation } = props;

  const navigateToScreen = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <TouchableOpacity style={styles.drawerButton} onPress={() => navigateToScreen('Maps')}>
        <Text style={styles.drawerButtonText}>Maps</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.drawerButton} onPress={() => navigateToScreen('Distance')}>
        <Text style={styles.drawerButtonText}>Distance</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

// Composant d'écran pour Maps
function MapsScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <Text>Maps Screen</Text>
      <Button
        title="Open Left Drawer"
        onPress={() => navigation.openDrawer()}
      />
    </View>
  );
}

// Composant d'écran pour Distance
function DistanceScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <Text>Distance Screen</Text>
      <Button
        title="Open Left Drawer"
        onPress={() => navigation.openDrawer()}
      />
    </View>
  );
}

// Drawer venant de la gauche
const LeftDrawer = createDrawerNavigator();
function LeftDrawerNavigator() {
  return (
    <LeftDrawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      drawerStyle={{
        width: '80%', // Vous pouvez ajuster la largeur
      }}
    >
      <LeftDrawer.Screen name="Home" component={HomeScreen} />
      <LeftDrawer.Screen name="Maps" component={MapsScreen} />
      <LeftDrawer.Screen name="Distance" component={DistanceScreen} />
    </LeftDrawer.Navigator>
  );
}

// Conteneur de navigation principal
function App() {
  return (
    <NavigationContainer>
      <LeftDrawerNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  drawer: {
    height: '50%',
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  drawerButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
    borderRadius: 5,
  },
  drawerButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default App;
