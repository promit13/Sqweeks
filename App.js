import React from "react";
import { StyleSheet, Alert, View } from "react-native";
import firebase from "react-native-firebase";
import { Provider } from "react-redux";
import stripe from "tipsi-stripe";
import AppNavigator from "./app/router";
import store from "./app/store";
import NavigationService from "./app/utils/NavigationService";
import { StripeApiKey } from "./app/config";
export default class App extends React.Component {
  state = {
    user: null,
  };
  componentDidMount = () => {
    stripe.setOptions({
      publishableKey: StripeApiKey,
      // merchantId: AppleMerachantKey // Optional
      // androidPayMode: 'test', // Android only
    });
    this.createNotificationListeners();
  };

  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
    this.messageListener();
  }

  // receives notification when the app is in background or foreground and tells what to do notification is clicked
  createNotificationListeners = async () => {
    // Triggered when a particular notification has been received in foreground
    this.notificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        const { title, body } = notification;
        console.log(title);
      });

    // If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen) => {
        console.log(notificationOpen.notification);
        const { title, body } = notificationOpen.notification;
        // NavigationService.navigate('Bookings');
      });

    // If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      console.log(notificationOpen.notification);
      const { title, body, data } = notificationOpen.notification;
      console.log(data);
      // NavigationService.navigate("Bookings");
    }

    // Triggered for data only payload in foreground
    this.messageListener = firebase.messaging().onMessage((message) => {
      //process data message
      console.log(JSON.stringify(message));
    });
  };

  render() {
    console.disableYellowBox = true;
    return (
      <Provider store={store}>
        <AppNavigator
          ref={(navigatorRef) => {
            NavigationService.setTopLevelNavigator(navigatorRef);
          }}
        />
      </Provider>
    );
  }
}
