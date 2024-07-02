import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { getDatabase, ref, onValue, update, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const db = getDatabase();
    const postsRef = ref(db, 'posts');

    onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      const postsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setPosts(postsArray);
      postsArray.forEach((post) => {
        fetchComments(post.id);
      });
    });
  }, []);

  const fetchComments = (postId) => {
    const db = getDatabase();
    const commentsRef = ref(db, `posts/${postId}/comments`);
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      const commentsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setComments(prev => ({ ...prev, [postId]: commentsArray }));
    });
  };

  const createNotification = async (postOwnerId, notificationType, notificationData) => {
    const db = getDatabase();
    const notificationsRef = ref(db, `notifications/${postOwnerId}`);
    const newNotificationRef = push(notificationsRef);

    try {
      if (postOwnerId !== user.uid) { // Vérifier que le propriétaire du post n'est pas l'utilisateur actuel
        await update(newNotificationRef, {
          ...notificationData,
          type: notificationType,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const handleLike = async (postId) => {
    const db = getDatabase();
    const postRef = ref(db, `posts/${postId}`);
  
    onValue(postRef, (snapshot) => {
      const post = snapshot.val();
      const likes = post.likes || {};
      const postOwnerId = post.userId;
  
      if (likes[user.uid]) {
        delete likes[user.uid];
      } else {
        likes[user.uid] = {
          username: user.displayName,
          userPhotoURL: user.photoURL,
          timestamp: Date.now(),
        };
        createNotification(postOwnerId, 'like', {
          userId: user.uid,
          username: user.displayName,
          userPhotoURL: user.photoURL,
        });
      }
  
      update(postRef, { likes });
    }, { onlyOnce: true });
  };
  

  const handleComment = async (postId) => {
    const db = getDatabase();
    const postRef = ref(db, `posts/${postId}`);
    const commentTextValue = commentText[postId];

    if (!commentTextValue || commentTextValue.trim() === '') {
      return;
    }

    const newComment = {
      text: commentTextValue,
      userId: user.uid,
      username: user.displayName,
      userPhotoURL: user.photoURL,
      timestamp: Date.now(),
    };

    try {
      const commentsRef = ref(db, `posts/${postId}/comments`);
      const newCommentRef = push(commentsRef);
      await update(newCommentRef, newComment);
      setCommentText(prev => ({ ...prev, [postId]: '' }));

      onValue(postRef, (snapshot) => {
        const post = snapshot.val();
        const postOwnerId = post.userId;

        if (postOwnerId !== user.uid) {
          createNotification(postOwnerId, 'comment', {
            userId: user.uid,
            username: user.displayName,
            userPhotoURL: user.photoURL,
            comment: commentTextValue,
          });
        }
      }, { onlyOnce: true });
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const renderPost = ({ item }) => {
    const likeCount = Object.values(item.likes || {}).length;
    const userLiked = !!(item.likes && item.likes[user.uid]);
    
    const commentCount = comments[item.id] ? comments[item.id].length : 0;

    return (
      <View style={styles.post}>
        <View style={styles.postHeader}>
          {item.userPhotoURL ? (
            <Image source={{ uri: item.userPhotoURL }} style={styles.profileImage} />
          ) : (
            <MaterialIcons name="person" size={40} color="gray" />
          )}
          <View style={styles.postInfo}>
            <Text style={styles.username}>{item.username || 'Unknown User'}</Text>
            <Text style={styles.createdAt}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        </View>
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
        <Text style={styles.postText}>{item.text}</Text>
        <View style={styles.reactions}>
          <TouchableOpacity style={styles.reactionButton} onPress={() => handleLike(item.id)}>
            <MaterialIcons name={userLiked ? "thumb-up" : "thumb-up-off-alt"} size={20} color={userLiked ? "blue" : "gray"} />
            <Text style={[styles.reactionText, userLiked && styles.likedText]}>{likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionButton} onPress={() => toggleComments(item.id)}>
            <MaterialIcons name="comment" size={20} color="gray" />
            <Text style={styles.reactionText}>Comments ({commentCount})</Text>
          </TouchableOpacity>
        </View>
        {showComments[item.id] && (
          <View style={styles.commentsSection}>
            <FlatList
              data={comments[item.id] || []}
              keyExtractor={(comment) => comment.id}
              renderItem={({ item: comment }) => (
                <View style={styles.comment}>
                  <Image source={{ uri: comment.userPhotoURL }} style={styles.commentUserImage} />
                  <View style={styles.commentTextContainer}>
                    <Text style={styles.commentUsername}>{comment.username}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                </View>
              )}
            />
            <View style={styles.commentInput}>
              <TextInput
                style={styles.commentInputField}
                placeholder="Add a comment..."
                value={commentText[item.id] || ''}
                onChangeText={(text) => setCommentText(prev => ({ ...prev, [item.id]: text }))}
                onSubmitEditing={() => handleComment(item.id)}
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
    />
  );
};

const styles = StyleSheet.create({
  post: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postInfo: {
    marginLeft: 10,
  },
  username: {
    fontWeight: 'bold',
  },
  createdAt: {
    color: 'gray',
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  postText: {
    fontSize: 16,
  },
  reactions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  reactionText: {
    marginLeft: 5,
    color: 'gray',
  },
  likedText: {
    color: 'blue',
  },
  commentsSection: {
    marginTop: 10,
  },
  comment: {
    flexDirection: 'row',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  commentUserImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInputField: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
});

export default Feed;
