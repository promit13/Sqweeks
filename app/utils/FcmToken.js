import firebase from "react-native-firebase";

// retrieves fcm token for notification
export const getFcmToken = async () => {
  let fcmToken = "";
  const enabled = await firebase.messaging().hasPermission();
  if (enabled) {
    fcmToken = await firebase.messaging().getToken();
    console.log("fcmtoken", fcmToken);
  } else {
    await firebase.messaging().requestPermission();
    fcmToken = await firebase.messaging().getToken();
    console.log("fcmtoken", fcmToken);
  }
  return fcmToken;
};
