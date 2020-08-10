import React, { Component } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  ImageBackground,
  ScrollView,
  Platform,
} from "react-native";
import { Icon, Text } from "react-native-elements";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import RNPickerSelect from "react-native-picker-select";
import ProgressDot from "../components/ProgressDot";
import ErrorMessage from "../components/Error";
import { ModalLoading } from "../components/LoadScreen";
import colors from "../style";

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 14,
    color: "grey",
  },
  containerStyle: {
    flex: 3,
    height: 60,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  inputContainerStyle: {
    flex: 2.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayTextStyle: {
    flex: 0.8,
    fontSize: 16,
  },
  circleBackground: {
    alignSelf: "center",
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    justifyContent: "center",
    marginBottom: 15,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: 4,
    color: "black",
    // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 4,
    color: "black", // to ensure the text is never behind the icon
  },
});

const pickerItems = [
  { label: "00:00:00", value: "00:00:00" },
  { label: "1:00:00", value: "1:00:00" },
  { label: "2:00:00", value: "2:00:00" },
  { label: "3:00:00", value: "3:00:00" },
  { label: "4:00:00", value: "4:00:00" },
  { label: "5:00:00", value: "5:00:00" },
  { label: "6:00:00", value: "6:00:00" },
  { label: "7:00:00", value: "7:00:00" },
  { label: "8:00:00", value: "8:00:00" },
  { label: "9:00:00", value: "9:00:00" },
  { label: "10:00:00", value: "10:00:00" },
  { label: "11:00:00", value: "11:00:00" },
  { label: "12:00:00", value: "12:00:00" },
  { label: "13:00:00", value: "13:00:00" },
  { label: "14:00:00", value: "14:00:00" },
  { label: "15:00:00", value: "15:00:00" },
  { label: "16:00:00", value: "16:00:00" },
  { label: "17:00:00", value: "17:00:00" },
  { label: "18:00:00", value: "18:00:00" },
  { label: "19:00:00", value: "19:00:00" },
  { label: "20:00:00", value: "20:00:00" },
  { label: "21:00:00", value: "21:00:00" },
  { label: "22:00:00", value: "22:00:00" },
  { label: "23:00:00", value: "23:00:00" },
];
class RegisterWorkingHours extends Component {
  static navigationOptions = {
    header: null,
  };
  state = {
    mondayStartTime: null,
    mondayEndTime: null,
    tuesdayStartTime: null,
    tuesdayEndTime: null,
    wednesdayStarTime: null,
    wednesdayEndTime: null,
    thursdayStarTime: null,
    thursdayEndTime: null,
    fridayStarTime: null,
    fridayEndTime: null,
    saturdayStarTime: null,
    saturdayEndTime: null,
    sundayStarTime: null,
    sundayEndTime: null,
    errorMessage: "",
    errorMessageVisible: false,
    loadscreen: false,
  };

  // submits working hours in firebase database
  submitWorkingHours = () => {
    const { userId } = this.props.user;
    this.setState({ loadscreen: true });
    const {
      mondayStartTime,
      mondayEndTime,
      tuesdayStartTime,
      tuesdayEndTime,
      wednesdayStarTime,
      wednesdayEndTime,
      thursdayStarTime,
      thursdayEndTime,
      fridayStarTime,
      fridayEndTime,
      saturdayStarTime,
      saturdayEndTime,
      sundayStarTime,
      sundayEndTime,
    } = this.state;
    const scheduleArray = [
      {
        Monday: [mondayStartTime, mondayEndTime],
        Tuesday: [tuesdayStartTime, tuesdayEndTime],
        Wednesday: [wednesdayStarTime, wednesdayEndTime],
        Thursday: [thursdayStarTime, thursdayEndTime],
        Friday: [fridayStarTime, fridayEndTime],
        Saturday: [saturdayStarTime, saturdayEndTime],
        Sunday: [sundayStarTime, sundayEndTime],
      },
    ];
    console.log(scheduleArray);
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .update({
        workingHours: scheduleArray,
        workingHoursSet: true,
      })
      .then(() =>
        this.setState({
          loadscreen: false,
          errorMessage: "",
          errorMessageVisible: false,
        })
      )
      .catch((err) => {
        this.setState({
          loadscreen: false,
          errorMessage: "Something went wrong",
          errorMessageVisible: true,
        });
        console.log(err);
      });
  };

  // creates view for each day to select working hours
  renderColumn = (day, startState, endState) => {
    return (
      <View style={styles.containerStyle}>
        <Text style={styles.dayTextStyle}>{day}</Text>
        <View style={styles.inputContainerStyle}>
          <Text style={styles.textStyle}>START</Text>
          <RNPickerSelect
            placeholder={{ label: "None", value: null }}
            onValueChange={(value) => this.setState({ [startState]: value })}
            items={pickerItems}
            useNativeAndroidPickerStyle={false}
            style={pickerSelectStyles}
          />
          {/* <View style={{ height: 20, width: 1, backgroundColor: "red" }} /> */}
          <Text style={styles.textStyle}>END</Text>
          <RNPickerSelect
            placeholder={{ label: "None", value: null }}
            onValueChange={(value) => this.setState({ [endState]: value })}
            items={pickerItems}
            useNativeAndroidPickerStyle={false}
            style={pickerSelectStyles}
          />
        </View>
      </View>
    );
  };

  // creates view to hold all the column for selecting selecting working hours each day
  renderBookScheduleView = () => {
    const { tuesdayStartTime, tuesdayEndTime } = this.state;
    console.log(tuesdayStartTime, tuesdayEndTime);
    return (
      <View>
        {this.renderColumn("Monday", "mondayStartTime", "mondayEndTime")}
        {this.renderColumn("Tuesday", "tuesdayStartTime", "tuesdayEndTime")}
        {this.renderColumn(
          "Wednesday",
          "wednesdayStarTime",
          "wednesdayEndTime"
        )}
        {this.renderColumn("Thursday", "thursdayStarTime", "thursdayEndTime")}
        {this.renderColumn("Friday", "fridayStarTime", "fridayEndTime")}
        {this.renderColumn("Saturday", "saturdayStarTime", "saturdayEndTime")}
        {this.renderColumn("Sunday", "sundayStarTime", "sundayEndTime")}
      </View>
    );
  };

  render() {
    const { errorMessage, errorMessageVisible, loadscreen } = this.state;
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "android" ? "" : "padding"}
        enabled
      >
        <ImageBackground
          source={require("../../assets/background.png")}
          style={{ flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flex: 1, paddingTop: 100 }}>
              <ProgressDot index={4} userType={true} />
              <Text
                style={{
                  alignSelf: "center",
                  marginTop: 30,
                  marginBottom: 30,
                  fontSize: 30,
                }}
              >
                Set your working hours
              </Text>
              {this.renderBookScheduleView()}
              {errorMessageVisible && (
                <ErrorMessage errorMessage={errorMessage} />
              )}
              {loadscreen && <ModalLoading text="Please wait" />}
              <Text
                style={{
                  alignSelf: "center",
                  paddingTop: 20,
                  paddingBottom: 10,
                }}
              >
                Finished
              </Text>
              <Icon
                containerStyle={[
                  styles.circleBackground,
                  {
                    backgroundColor: "black",
                  },
                ]}
                name="ios-checkmark"
                type="ionicon"
                color="white"
                size={25}
                onPress={() => this.submitWorkingHours()}
                underlayColor="transparent"
              />
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}
const mapStateToProps = ({ checkUser }) => {
  const { user } = checkUser;
  console.log("MAP RED", user);
  return {
    user,
  };
};

export default connect(mapStateToProps)(RegisterWorkingHours);
