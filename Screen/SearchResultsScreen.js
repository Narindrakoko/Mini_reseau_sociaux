import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const SearchResultsScreen = ({ route }) => {
  const { searchResults } = route.params || []; // Récupérer les résultats de recherche depuis les paramètres de navigation

  const renderItem = ({ item }) => (
    <View style={styles.resultItem}>
      <Text>{item.name}</Text>
      {/* Ajouter d'autres détails sur l'utilisateur ou la publication ici */}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});

export default SearchResultsScreen;
