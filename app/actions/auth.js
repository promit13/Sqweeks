import firebase from "react-native-firebase";
import { CHECK_USER, ACTION_LOGOUT } from "./types";
import { dispatch } from "rxjs/internal/observable/pairs";

// checks if the user is available and fetches user details from the firebase database
export const handleUserStatus = (user) => (dispatch) => {
  if (user === null) {
    dispatch({
      type: CHECK_USER,
      payload: {},
    });
  } else {
    console.log(user.uid);
    firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((response) => {
        const currentUser = response.data();
        dispatch({
          type: CHECK_USER,
          payload: { ...currentUser, userId: user.uid },
        });
      });
  }
};

export const logoutUser = () => (dispatch) => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      dispatch({
        type: ACTION_LOGOUT,
      });
    });
};
