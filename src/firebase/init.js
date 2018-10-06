import firebase from 'firebase';
import firestore from 'firebase/firestore';

// Initialize Firebase
var config = {
    apiKey: "AIzaSyDU4vqX6EzccqnPt9dhH6Mgmy19qi9RKMU",
    authDomain: "vue-ninja-smoothies-a59bc.firebaseapp.com",
    databaseURL: "https://vue-ninja-smoothies-a59bc.firebaseio.com",
    projectId: "vue-ninja-smoothies-a59bc",
    storageBucket: "vue-ninja-smoothies-a59bc.appspot.com",
    messagingSenderId: "57658576619"
  };
  
const firebaseApp = firebase.initializeApp(config);
firebaseApp.firestore().settings({timestampsInSnapshots: true});

// export firestore database
export default firebaseApp.firestore();
