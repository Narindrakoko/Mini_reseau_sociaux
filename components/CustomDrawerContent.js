import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image } from 'react-native';

const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.drawerHeader}>
        <Image source={require('../assets/8.jpg')} style={styles.logo} />
        <Text style={styles.drawerHeaderText}>Welcome!</Text>
      </View>
      <DrawerItem
        label="Accueil"
        onPress={() => props.navigation.navigate('Home')}
      />
      <DrawerItem
        label="Maps"
        onPress={() => props.navigation.navigate('Maps')}
      />
      <DrawerItem
        label="Item"
        onPress={() => props.navigation.navigate('Item')}
      />
      
      <DrawerItem
        label="A propos"
        onPress={() => props.navigation.navigate('Info')}
      />
      
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 16,
  },
  drawerHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;
