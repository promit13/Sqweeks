import React, { Component, Fragment } from "react";
import { Text, StyleSheet, ImageBackground } from "react-native";

const styles = StyleSheet.create({
  imageBackground: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  textStyle: {
    fontSize: 30,
    textAlign: "center"
  }
});

export default class ApprovalMessageScreen extends Component {
  static navigationOptions = {
    header: null
  };

  render() {
    return (
      <ImageBackground
        source={require("../../assets/background.png")}
        style={styles.imageBackground}
      >
        <Text style={styles.textStyle}>
          We will notify you once your CRB check is done.
        </Text>
      </ImageBackground>
    );
  }
}
