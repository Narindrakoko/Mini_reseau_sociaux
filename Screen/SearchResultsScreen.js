import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SearchResultsScreen = ({ route }) => {
  const { searchTerm } = route.params;
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      const db = getDatabase();
      const postsRef = ref(db, 'posts');

      try {
        const snapshot = await get(postsRef);
        const data = snapshot.val();
        console.log('Fetched data:', data);

        if (data) {
          const results = Object.keys(data)
            .map((key) => {
              const post = { id: key, ...data[key] };
              console.log('Processing post:', post);
              return post;
            })
            .filter((post) => {
              const textMatch = post.text && typeof post.text === 'string' && post.text.toLowerCase().includes(searchTerm.toLowerCase());
              const usernameMatch = post.username && typeof post.username === 'string' && post.username.toLowerCase().includes(searchTerm.toLowerCase());
              console.log(`Post ID: ${post.id} | Text Match: ${textMatch} | Username Match: ${usernameMatch}`);
              return textMatch || usernameMatch;
            });

          console.log('Filtered results:', results);
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error fetching search data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  const goToUserProfile = (userId) => {
    navigation.navigate('Profile2', { userId });
  };

  useEffect(() => {
    fetchPosts();
  }, []);
  
  // Affichez l'état posts pour vérifier son contenu
  useEffect(() => {
    console.log('posts state updated:', posts);
  }, [posts]);

  const fetchPosts = async () => {
    try {
      const postsRef = firestore().collection('posts');
      const snapshot = await postsRef.get();
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      console.log('Fetched data:', postsData); // Assurez-vous que les données sont correctes
  
      setPosts(postsData.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  

  const PostCard = ({ imageUrl, text, createdAt, userPhotoURL, username, likes, comments }) => {
    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <Text>{text}</Text>
        <Text>{new Date(createdAt).toLocaleDateString()}</Text>
        <Text>{username}</Text>
        <Image source={{ uri: userPhotoURL }} style={styles.profilePic} />
        {/* Ajoutez l'affichage des likes et des commentaires si nécessaire */}
      </View>
    );
  };
  

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
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={<Text style={styles.noResultsText}>No results found.</Text>}
        />
      )}


<ScrollView>
    {posts.map(post => (
      <PostCard
        key={post.id}
        id={post.id}
        imageUrl={post.imageUrl}
        text={post.text}
        createdAt={post.createdAt}
        userPhotoURL={post.userPhotoURL}
        username={post.username}
        likes={post.likes}
        comments={post.comments}
      />
    ))}
  </ScrollView>



    </View>



  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  flatListContent: {
    paddingBottom: 10,
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
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postInfo: {
    justifyContent: 'center',
  },
  username: {
    fontWeight: 'bold',
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

    card: {
    padding: 10,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 200,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default SearchResultsScreen;
