import * as firebase from "firebase";
import * as geofirex from "geofirex";
import "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCsc7p9_EUB9VW7H9rgkN3jeXBE7S_t7FA",
  authDomain: "sqweek-70f0f.firebaseapp.com",
  databaseURL: "https://sqweek-70f0f.firebaseio.com",
  projectId: "sqweek-70f0f",
  storageBucket: "sqweek-70f0f.appspot.com",
  messagingSenderId: "108826488993",
  appId: "1:108826488993:web:b39fcd15b3764671b440e0",
  measurementId: "G-GBNRBVCR41",
};

firebase.initializeApp(firebaseConfig);

export const geo = geofirex.init(firebase);
export const GOOGLE_API = "AIzaSyAzny6yRXLVY91uAUPZAKRtwpU3pMcP7VI";

export default firebase;
