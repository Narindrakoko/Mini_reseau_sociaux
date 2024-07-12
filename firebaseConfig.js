import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "your api key",

  authDomain: "your auth domain",

  databaseURL: "your database url",

  projectId: "your project id",

  storageBucket: "your storage bucket",

  messagingSenderId: "your messaging sender id",

  appId: "your app id",

  measurementId: "your measurement id"

};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const database = getDatabase(app);

export { app, auth, database };