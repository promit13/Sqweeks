import React, { Component, Fragment } from "react";
import {
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  ImageBackground,
  Platform,
} from "react-native";
import { Icon, Text } from "react-native-elements";
import { Formik } from "formik";
import * as yup from "yup";
import firebase from "react-native-firebase";
import { ScrollView } from "react-native-gesture-handler";
import ProgressDot from "../components/ProgressDot";
import ErrorMessage from "../components/Error";
import colors from "../style";
import { ModalLoading } from "../components/LoadScreen";

const styles = StyleSheet.create({
  inputStyle: {
    height: 70,
    backgroundColor: "white",
    paddingHorizontal: 10,
    marginTop: 1,
    fontSize: 20,
  },
  textErrorStyle: {
    fontSize: 16,
    color: "red",
    margin: 5,
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

export default class Register extends Component {
  static navigationOptions = {
    title: "Register",
    headerStyle: {
      backgroundColor: colors.accent,
    },
    headerTintColor: "#fff",
    headerTitleStyle: {
      fontWeight: "bold",
      fontSize: 20,
    },
  };

  state = {
    mondayStartTime: null,
    mondayEndTime: null,
    tuesdayStarTime: null,
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
    passportUrl: "",
    lisenceUrl: "",
    insuranceUrl: "",
    niNumber: "",
    errorMessage: "",
    errorMessageVisible: false,
    loadscreen: false,
  };

  // creates user on firebase with email and password provided
  // and sends user details to firebase database
  registerProfile = (values) => {
    console.log("CHECK");
    this.setState({ loadscreen: true });
    const { name, surname, email, password } = values;
    const { fcmToken, userType } = this.props.navigation.state.params;
    const userDetails = {
      fullName: `${name} ${surname}`,
      email,
      location: [],
      cardDetail: [],
      locationRegistered: false,
      cardRegistered: false,
      tutorial: false,
      messagingToken: fcmToken,
      userType,
      crbChecked: false,
      workingHoursSet: false,
      workingHours: [],
      crbDetail: [],
      crbApproved: false,
      aboutMe: "",
      profilePic: "",
      agreementAccepted: false,
    };
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((user) => {
        const { uid } = user.user;
        firebase.firestore().collection("users").doc(uid).set(userDetails);
        this.setState({
          errorMessage: "",
          errorMessageVisible: false,
          loadscreen: false,
        });
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.message,
          errorMessageVisible: true,
          loadscreen: false,
        });
        console.log(error);
      });
  };

  render() {
    const { userType } = this.props.navigation.state.params;
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
            <View style={{ flex: 1, paddingTop: 50 }}>
              <ProgressDot index={0} userType={userType} />
              <Text
                style={{
                  alignSelf: "center",
                  marginTop: 30,
                  marginBottom: 30,
                  fontSize: 60,
                }}
              >
                Profile
              </Text>

              <Formik
                initialValues={{
                  name: "",
                  surname: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                }}
                onSubmit={(values) => {
                  this.registerProfile(values);
                }}
                validationSchema={yup.object().shape({
                  name: yup.string().required("Name missing"),
                  surname: yup.string().required("Surname missing"),
                  email: yup.string().email().required("Email missing"),
                  password: yup.string().min(6).required("Password missing"),
                  confirmPassword: yup
                    .string()
                    .min(6)
                    .required("Password does not match")
                    .oneOf(
                      [yup.ref("password"), null],
                      "Password does not match"
                    ),
                })}
              >
                {({
                  values,
                  handleChange,
                  errors,
                  setFieldTouched,
                  touched,
                  isValid,
                  handleSubmit,
                }) => (
                  <Fragment>
                    <View>
                      <TextInput
                        style={styles.inputStyle}
                        value={values.name}
                        onChangeText={handleChange("name")}
                        onBlur={() => setFieldTouched("name")}
                        placeholder="Name"
                        placeholderTextColor="grey"
                      />
                      {touched.name && errors.name && (
                        <Text style={styles.textErrorStyle}>{errors.name}</Text>
                      )}
                      <TextInput
                        style={styles.inputStyle}
                        value={values.surname}
                        onChangeText={handleChange("surname")}
                        onBlur={() => setFieldTouched("surname")}
                        placeholder="Surname"
                        placeholderTextColor="grey"
                      />
                      {touched.surname && errors.surname && (
                        <Text style={styles.textErrorStyle}>
                          {errors.surname}
                        </Text>
                      )}
                      <TextInput
                        style={styles.inputStyle}
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={() => setFieldTouched("email")}
                        placeholder="Email"
                        placeholderTextColor="grey"
                        keyboardType="email-address"
                      />
                      {touched.email && errors.email && (
                        <Text style={styles.textErrorStyle}>
                          {errors.email}
                        </Text>
                      )}
                      <TextInput
                        style={styles.inputStyle}
                        value={values.password}
                        onChangeText={handleChange("password")}
                        placeholder="Password"
                        placeholderTextColor="grey"
                        onBlur={() => setFieldTouched("password")}
                        secureTextEntry={true}
                      />
                      {touched.password && errors.password && (
                        <Text style={styles.textErrorStyle}>
                          {errors.password}
                        </Text>
                      )}

                      <TextInput
                        style={styles.inputStyle}
                        value={values.confirmPassword}
                        onChangeText={handleChange("confirmPassword")}
                        placeholder="Confirm Password"
                        placeholderTextColor="grey"
                        onBlur={() => setFieldTouched("confirmPassword")}
                        secureTextEntry={true}
                      />
                      {touched.confirmPassword && errors.confirmPassword && (
                        <Text style={styles.textErrorStyle}>
                          {errors.confirmPassword}
                        </Text>
                      )}
                    </View>

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
                      Next
                    </Text>
                    <Icon
                      containerStyle={[
                        styles.circleBackground,
                        {
                          backgroundColor: "white",
                        },
                      ]}
                      name="ios-arrow-forward"
                      type="ionicon"
                      color="black"
                      size={25}
                      onPress={handleSubmit}
                      underlayColor="transparent"
                    />
                  </Fragment>
                )}
              </Formik>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}
