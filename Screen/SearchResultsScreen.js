import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SearchResultsScreen = ({ route }) => {
  const searchTerm = route.params?.searchTerm || '';
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchTerm);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      const db = getDatabase();
      const usersRef = ref(db, 'users');
      const postsRef = ref(db, 'posts');

      try {
        const [usersSnapshot, postsSnapshot] = await Promise.all([get(usersRef), get(postsRef)]);
        const usersData = usersSnapshot.val();
        const postsData = postsSnapshot.val();

        if (usersData && postsData) {
          const userResults = Object.keys(usersData)
            .map((key) => {
              const user = { id: key, ...usersData[key] };
              return user;
            })
            .filter((user) => {
              const nameMatch = user.displayName && typeof user.displayName === 'string' && user.displayName.toLowerCase().includes(searchQuery.toLowerCase());
              return nameMatch;
            });

          const postResults = Object.keys(postsData)
            .map((key) => {
              const post = { id: key, ...postsData[key] };
              return post;
            })
            .filter((post) => {
              const textMatch = post.text && typeof post.text === 'string' && post.text.toLowerCase().includes(searchQuery.toLowerCase());
              const usernameMatch = post.username && typeof post.username === 'string' && post.username.toLowerCase().includes(searchQuery.toLowerCase());
              return textMatch || usernameMatch;
            });

          setSearchResults({ users: userResults, posts: postResults });
        } else {
          setSearchResults({ users: [], posts: [] });
        }
      } catch (error) {
        console.error('Error fetching search data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const goToUserProfile = (userId) => {
    navigation.navigate('Profile2', { userId });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => goToUserProfile(item.id)}>
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.profileImage} />
      ) : (
        <MaterialIcons name="person" size={40} color="gray" />
      )}
      <Text style={styles.username}>{item.displayName || 'Unknown User'}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        {item.userPhotoURL ? (
          <Image source={{ uri: item.userPhotoURL }} style={styles.profileImage} />
        ) : (
          <MaterialIcons name="person" size={40} color="gray" />
        )}
        <View style={styles.postInfo}>
          <TouchableOpacity onPress={() => goToUserProfile(item.userId)}>
            <Text style={styles.username}>{item.username || 'Unknown User'}</Text>
          </TouchableOpacity>
          <Text style={styles.createdAt}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
      <Text style={styles.postText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {loading ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Utilisateurs</Text>
          <FlatList
            data={searchResults.users}
            keyExtractor={(item) => item.id}
            renderItem={renderUser}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={<Text style={styles.noResultsText}>Aucun utilisateur trouvé.</Text>}
          />
          <Text style={styles.sectionTitle}>Publications</Text>
          <FlatList
            data={searchResults.posts}
            keyExtractor={(item) => item.id}
            renderItem={renderPost}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={<Text style={styles.noResultsText}>Aucune publication trouvée.</Text>}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  flatListContent: {
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: 'bold',
  },
  post: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 1,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postInfo: {
    justifyContent: 'center',
  },
  createdAt: {
    color: 'gray',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postText: {
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  noResultsText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SearchResultsScreen;
