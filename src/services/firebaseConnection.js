import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

let firebaseConfig = {
  apiKey: "AIzaSyDtPaIMm-s6UYt5MoHGpnKHaDX72DwXR3M",
  authDomain: "sistema-896f4.firebaseapp.com",
  projectId: "sistema-896f4",
  storageBucket: "sistema-896f4.appspot.com",
  messagingSenderId: "1088914203180",
  appId: "1:1088914203180:web:d4d823fed7aa033809a789",
  measurementId: "G-9H4T338K42"
};

if(!firebase.apps.length){
  firebase.initializeApp(firebaseConfig);
}

export default firebase;