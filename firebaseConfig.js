import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAJCxkI9wkzsho370DenKbJPUFbMEwkBmg",

  authDomain: "devgeolocalisation.firebaseapp.com",

  databaseURL: "https://devgeolocalisation-default-rtdb.firebaseio.com",

  projectId: "devgeolocalisation",

  storageBucket: "devgeolocalisation.appspot.com",

  messagingSenderId: "426992373456",

  appId: "1:426992373456:web:5594a6f27aa53244ba18d5",

  measurementId: "G-G714PN43YZ"

};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const database = getDatabase(app);

export { app, auth, database };
