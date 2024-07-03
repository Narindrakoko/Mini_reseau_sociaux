import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { getDatabase, ref, onValue, update, push, remove } from 'firebase/database';
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

    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      const postsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setPosts(postsArray);
      postsArray.forEach((post) => {
        fetchComments(post.id);
      });
    });

    return () => unsubscribe();
  }, []);

  const fetchComments = useCallback((postId) => {
    const db = getDatabase();
    const commentsRef = ref(db, `posts/${postId}/comments`);
    onValue(commentsRef, (snapshot) => {
      const data = snapshot.val();
      const commentsArray = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setComments(prev => ({ ...prev, [postId]: commentsArray }));
    }, { onlyOnce: true });
  }, []);

  const createNotification = useCallback(async (postOwnerId, notificationType, notificationData) => {
    const db = getDatabase();
    const notificationsRef = ref(db, `notifications/${postOwnerId}`);
    const newNotificationRef = push(notificationsRef);

    try {
      if (postOwnerId !== user.uid) {
        await update(newNotificationRef, {
          ...notificationData,
          type: notificationType,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [user.uid]);

  const handleLike = useCallback(async (postId) => {
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
  }, [createNotification, user.uid, user.displayName, user.photoURL]);

  const handleLaugh = useCallback(async (postId) => {
    const db = getDatabase();
    const postRef = ref(db, `posts/${postId}`);

    onValue(postRef, (snapshot) => {
      const post = snapshot.val();
      const laughs = post.laughs || {};
      const postOwnerId = post.userId;

      if (laughs[user.uid]) {
        delete laughs[user.uid];
      } else {
        laughs[user.uid] = {
          username: user.displayName,
          userPhotoURL: user.photoURL,
          timestamp: Date.now(),
        };
        createNotification(postOwnerId, 'laugh', {
          userId: user.uid,
          username: user.displayName,
          userPhotoURL: user.photoURL,
        });
      }

      update(postRef, { laughs });
    }, { onlyOnce: true });
  }, [createNotification, user.uid, user.displayName, user.photoURL]);

  const handleComment = useCallback(async (postId) => {
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
  }, [commentText, createNotification, user.uid, user.displayName, user.photoURL]);

  const handleShare = useCallback(async (postId) => {
    const db = getDatabase();
    const postsRef = ref(db, 'posts');
    const postRef = ref(db, `posts/${postId}`);

    onValue(postRef, async (snapshot) => {
      const post = snapshot.val();

      const sharedPost = {
        ...post,
        sharedBy: {
          userId: user.uid,
          username: user.displayName,
          userPhotoURL: user.photoURL,
          timestamp: Date.now(),
        }
      };

      await push(postsRef, sharedPost);

      createNotification(post.userId, 'share', {
        userId: user.uid,
        username: user.displayName,
        userPhotoURL: user.photoURL,
        postId: postId,
      });

      Alert.alert('Post shared!');
    }, { onlyOnce: true });
  }, [createNotification, user.uid, user.displayName, user.photoURL]);

  const toggleComments = useCallback((postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const handleDeleteComment = useCallback(async (postId, commentId) => {
    const db = getDatabase();
    const commentRef = ref(db, `posts/${postId}/comments/${commentId}`);
    try {
      await remove(commentRef);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }, []);

  const renderPost = useCallback(({ item }) => {
    const likeCount = Object.values(item.likes || {}).length;
    const userLiked = !!(item.likes && item.likes[user.uid]);
    
    const laughCount = Object.values(item.laughs || {}).length;
    const userLaughed = !!(item.laughs && item.laughs[user.uid]);

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
        {item.sharedBy && (
          <View style={styles.sharedBy}>
            {item.sharedBy.userPhotoURL ? (
              <Image source={{ uri: item.sharedBy.userPhotoURL }} style={styles.sharedByImage} />
            ) : (
              <MaterialIcons name="person" size={20} color="gray" />
            )}
            <Text style={styles.sharedByText}> {item.sharedBy.username} a partager cette publication</Text>
          </View>
        )}
        {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.postImage} />}
        <Text style={styles.postText}>{item.text}</Text>
        <View style={styles.reactions}>
          <TouchableOpacity style={styles.reactionButton} onPress={() => handleLike(item.id)}>
            <MaterialIcons name={userLiked ? "favorite" : "favorite-border"} size={20} color={userLiked ? "red" : "gray"} />
            <Text style={[styles.reactionText, userLiked && styles.likedText]}>{likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionButton} onPress={() => handleLaugh(item.id)}>
            <MaterialIcons name={userLaughed ? "sentiment-very-satisfied" : "sentiment-satisfied"} size={20} color={userLaughed ? "yellow" : "gray"} />
            <Text style={[styles.reactionText, userLaughed && styles.laughedText]}>{laughCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionButton} onPress={() => toggleComments(item.id)}>
            <MaterialIcons name="comment" size={20} color="gray" />
            <Text style={styles.reactionText}>{commentCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionButton} onPress={() => handleShare(item.id)}>
            <MaterialIcons name="share" size={20} color="gray" />
          </TouchableOpacity>
        </View>
        {showComments[item.id] && (
          <View style={styles.commentsSection}>
            {comments[item.id] && comments[item.id].map((comment) => (
              <View key={comment.id} style={styles.comment}>
                {comment.userPhotoURL ? (
                  <Image source={{ uri: comment.userPhotoURL }} style={styles.commentUserImage} />
                ) : (
                  <MaterialIcons name="person" size={30} color="gray" />
                )}
                <View style={styles.commentTextContainer}>
                  <Text style={styles.commentUsername}>{comment.username}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  {comment.userId === user.uid && (
                    <TouchableOpacity onPress={() => handleDeleteComment(item.id, comment.id)}>
                      <MaterialIcons name="delete" size={20} color="red" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            <View style={styles.commentInput}>
              <TextInput
                style={styles.commentInputField}
                placeholder="Add a comment..."
                value={commentText[item.id] || ''}
                onChangeText={(text) => setCommentText(prev => ({ ...prev, [item.id]: text }))}
              />
              <TouchableOpacity onPress={() => handleComment(item.id)}>
                <MaterialIcons name="send" size={24} color="blue" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }, [comments, handleComment, handleDeleteComment, handleLaugh, handleLike, handleShare, showComments, toggleComments, user.uid]);

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
  post: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
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
    fontSize: 12,
    color: 'gray',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  postText: {
    fontSize: 16,
    marginBottom: 10,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionText: {
    marginLeft: 5,
  },
  likedText: {
    color: 'red',
  },
  laughedText: {
    color: 'yellow',
  },
  sharedBy: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  sharedByText: {
    marginLeft: 5,
    color: 'gray',
    fontStyle: 'italic',
  },
  sharedByImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
  },
  commentsSection: {
    marginTop: 10,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
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
  },
  commentText: {
    fontSize: 14,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInputField: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
});

export default Feed;
