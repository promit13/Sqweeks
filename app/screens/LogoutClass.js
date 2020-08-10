import React from "react";
import { View, Text } from "react-native";
import LoadScreen from "../components/LoadScreen";
import { connect } from "react-redux";
import { logoutUser } from "../actions";

class LogoutClass extends React.Component {
  state = { loading: true };
  componentDidMount() {
    this.props.logoutUser();
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <LoadScreen text="Logging out" />
      </View>
    );
  }
}

const mapDispatchToProps = {
  logoutUser,
};

export default connect(null, mapDispatchToProps)(LogoutClass);
