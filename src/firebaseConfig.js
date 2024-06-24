import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBl6UdxUqplXtq2W81rdC9GHLAMNZbSV54",
    authDomain: "treetracking-fb936.firebaseapp.com",
    projectId: "treetracking-fb936",
    storageBucket: "treetracking-fb936.appspot.com",
    messagingSenderId: "824267531814",
    appId: "1:824267531814:web:eadaf95812f3fd989ce8e7",

  
  };
  
 const app = initializeApp(firebaseConfig);
 const firebaseApp = initializeApp(firebaseConfig);

  // Initialize Auth with AsyncStorage persistence
  const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
  
// Get the Firestore instance
const db = getFirestore(app);

export { auth, db };
