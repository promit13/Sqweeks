import React from "react";
import { ActivityIndicator, View } from "react-native";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import { handleUserStatus } from "../actions";

class AuthLoadingScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    user: null,
    currentUser: null,
    loading: true,
  };

  componentDidMount() {
    this.handleConnectivityChange();
  }

  componentWillUnmount() {
    this.authSubscription();
  }

  // detects auth changes (login and logout)
  // and if the user is logged in, calls the action handleUserStatus to get user datas from firebase
  handleConnectivityChange = () => {
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      if (user === null) {
        return this.setState({ loading: false, user });
      }
      this.setState({ user, loading: false });
      this.props.handleUserStatus(user);
    });
  };

  // navigates to screen based on user data from firebase
  renderComponent = () => {
    const { user, loading } = this.state;
    if (loading) return <ActivityIndicator />;
    if (user) {
      console.log(user);
      if (this.props.user === undefined) return <ActivityIndicator />;
      const {
        locationRegistered,
        cardRegistered,
        tutorial,
        userType,
        crbChecked,
        workingHoursSet,
        crbApproved,
        agreementAccepted,
      } = this.props.user;
      console.log(agreementAccepted);
      if (!locationRegistered) {
        return this.props.navigation.navigate("LocationRegistration");
      }
      if (!cardRegistered) {
        return this.props.navigation.navigate("CardRegistration");
      }
      if (userType && !crbChecked) {
        return this.props.navigation.navigate("CrbRegistration");
      }
      if (userType && !workingHoursSet) {
        return this.props.navigation.navigate("WorkingHourRegistration");
      }
      if (!agreementAccepted) {
        return this.props.navigation.navigate("Terms", { user, userType });
      }
      if (userType && !crbApproved) {
        return this.props.navigation.navigate("ApprovalScreen");
      }
      if (!tutorial) {
        return this.props.navigation.navigate("TutorialDisplay");
      }
      if (userType) {
        return this.props.navigation.navigate("WasherSignedIn", {
          user,
          userType,
        });
      }
      this.props.navigation.navigate("OwnerSignedIn", { user, userType });
    } else {
      this.props.navigation.navigate("SignedOut");
    }
  };

  render() {
    return <View>{this.renderComponent()}</View>;
  }
}

const mapStateToProps = ({ checkUser }) => {
  const { user } = checkUser;
  console.log("LOGIN RED", user);
  return {
    user,
  };
};

// all the actions
const mapDispatchToProps = {
  handleUserStatus,
};

export default connect(mapStateToProps, mapDispatchToProps)(AuthLoadingScreen);
