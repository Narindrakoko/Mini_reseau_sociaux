import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, database } from '../firebaseConfig';
import { ref, push, onValue, get, set, child, update, remove } from 'firebase/database';
import { Ionicons } from '@expo/vector-icons';

const ChatScreen = ({ navigation, route }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const currentUser = auth.currentUser;
  const selectedUser = route.params?.user;
  const storage = getStorage();
  const audioPlayer = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      const chatId = getChatId(currentUser.uid, selectedUser.id);
      const messagesRef = ref(database, `messages/${chatId}`);

      const unsubscribe = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const messageList = Object.entries(data).map(([key, value]) => ({
            id: key,
            content: value.content,
            audioURL: value.audioURL || null,
            sender: value.sender,
            receiverId: value.receiverId,
            timestamp: value.timestamp,
            read: value.read,
          })).sort((a, b) => a.timestamp - b.timestamp);
          setMessages(messageList);
        } else {
          setMessages([]);
        }
      });

      return () => unsubscribe();
    }
  }, [selectedUser, currentUser]);

  const sendMessage = () => {
    if (message.trim() && selectedUser) {
      const chatId = getChatId(currentUser.uid, selectedUser.id);
      const newMessageRef = push(ref(database, `messages/${chatId}`));
      const newMessageData = {
        content: message,
        sender: currentUser.uid,
        receiverId: selectedUser.id,
        timestamp: Date.now(),
        read: {
          [currentUser.uid]: true,
          [selectedUser.id]: false,
        },
      };
      set(newMessageRef, newMessageData);
  
      setMessage('');
    }
  };

  const getChatId = (userId1, userId2) => [userId1, userId2].sort().join('-');

  const startRecording = async () => {
    try {
      if (recording) {
        console.warn('Already recording, stopping the current recording first.');
        await stopRecording();
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') throw new Error('Permission to access microphone is required');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        setIsRecording(false);
        await uploadAudio(uri);
      } catch (error) {
        console.error('Failed to stop recording', error);
      }
    }
  };

  const uploadAudio = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const audioRef = storageRef(storage, `audioMessages/${Date.now()}.m4a`);
      await uploadBytes(audioRef, blob);

      const downloadURL = await getDownloadURL(audioRef);
      sendAudioMessage(downloadURL);
    } catch (error) {
      console.error('Failed to upload audio', error);
    }
  };

  const sendAudioMessage = (audioURL) => {
    if (audioURL && selectedUser) {
      const chatId = getChatId(currentUser.uid, selectedUser.id);
      const newMessageRef = push(ref(database, `messages/${chatId}`));
      const newMessageData = {
        content: '',
        audioURL: audioURL,
        sender: currentUser.uid,
        receiverId: selectedUser.id,
        timestamp: Date.now(),
        read: {
          [currentUser.uid]: true,
          [selectedUser.id]: false,
        },
      };
      set(newMessageRef, newMessageData);
    }
  };

  const playAudio = async (audioURL) => {
    try {
      if (audioPlayer.current) {
        await audioPlayer.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioURL });
      audioPlayer.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play audio', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Image source={{ uri: selectedUser?.photoURL }} style={styles.userAvatar} />
        <Text style={styles.username}>{selectedUser?.name}</Text>
      </View>
      <View style={styles.chatContainer}>
        {messages.length === 0 ? (
          <Text style={styles.noMessageText}>Aucun message pour l'instant</Text>
        ) : (
          <FlatList
            data={messages.reverse()} // Inverse l'ordre des messages pour afficher les plus récents en bas
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageContainer,
                  item.sender === currentUser.uid ? styles.sentMessage : styles.receivedMessage,
                ]}
              >
                {item.content ? (
                  <Text style={styles.messageText}>{item.content}</Text>
                ) : (
                  <TouchableOpacity onPress={() => playAudio(item.audioURL)}>
                    <Text style={styles.audioMessageText}>Message Audio</Text>
                  </TouchableOpacity>
                )}
                {item.sender === currentUser.uid && (
                  <Text style={styles.senderIndicator}>vous</Text>
                )}
                {item.sender === currentUser.uid && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteMessage(item.id)}
                  >
                    <Ionicons name="trash-bin-outline" size={24} color="#888" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            contentContainerStyle={styles.messageList}
            inverted // Inverser l'ordre des messages ici
          />
        )}
        <View style={styles.inputContainer}>
          {isRecording ? (
            <TouchableOpacity style={styles.recordingButton} onPress={stopRecording}>
              <Text style={styles.recordingButtonText}>Arrêter l'enregistrement</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.audioButton} onPressIn={startRecording}>
              <Ionicons name="mic" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Entrez votre message"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  userList: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#fff',
    elevation: 2,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#e5ddd5',
  },
  messageList: {
    padding: 10,
    flexGrow: 1, // Pour que la liste s'étende et puisse scroller
    justifyContent: 'flex-end', // Met les messages en bas
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  sentMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#fff',
  },
  messageText: {
    color: '#333',
  },
  audioMessageText: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  noMessageText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#f2f2f2',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#075e54',
    padding: 10,
    borderRadius: 20,
    marginRight: 5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  audioButton: {
    backgroundColor: '#075e54',
    padding: 10,
    borderRadius: 20,
  },
  recordingButton: {
    backgroundColor: '#ff3b30',
    padding: 10,
    borderRadius: 20,
  },
  recordingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  deleteButton: {
    marginLeft: 10,
  },
  senderIndicator: {
    fontSize: 12,
    color: 'gray',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
});

export default ChatScreen;
