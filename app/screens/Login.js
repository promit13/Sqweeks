import React, { Component, Fragment } from "react";
import {
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
  Image,
  Platform,
  ScrollView,
  ImageBackground,
  KeyboardAvoidingView,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import { Button, Icon, CheckBox } from "react-native-elements";
import { moderateScale } from "react-native-size-matters";
import firebase from "react-native-firebase";
import Modal from "react-native-modal";
import { getFcmToken } from "../utils/FcmToken";
import ErrorMessage from "../components/Error";
import LoadScreen from "../components/LoadScreen";
import colors from "../style";

var { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  loginText: {
    color: "white",
    textAlign: "center",
    alignSelf: "center",
    fontSize: 20,
  },
  fieldContainer: {
    flexDirection: "row",
    margin: 10,
    marginLeft: 40,
    marginRight: 40,
    borderRadius: 50,
    borderColor: "white",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 2,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  textInputStyle: {
    flex: 1,
    height: 40,
    color: "black",
    marginLeft: 10,
    fontSize: 18,
  },
  textErrorStyle: {
    fontSize: 16,
    color: "red",
    marginLeft: 40,
    marginVertical: 10,
  },
  button: {
    borderRadius: moderateScale(5),
    backgroundColor: colors.accent,
    height: 40,
    margin: 15,
  },
});

export default class Login extends Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    secureTextEntry: true,
    fcmToken: "",
    showError: false,
    errorMessage: "",
    loading: false,
    modalVisible: false,
    washerChecked: false,
    ownerChecked: false,
  };

  componentDidMount = async () => {
    const fcmToken = await getFcmToken();
    this.setState({ fcmToken });
  };

  // signs in user to the app
  handleSubmit = (email, password) => {
    this.setState({ loading: true });
    const { fcmToken } = this.state;
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((response) => {
        this.setState({ showError: false, errorMessage: "" });
        const { uid } = response.user;
        firebase
          .firestore()
          .collection("users")
          .doc(uid)
          .update({ messagingToken: fcmToken })
          .then(() => this.setState({ loading: false }))
          .catch(() => this.setState({ loading: false }));
      })
      .catch((error) => {
        const errorMessage =
          error.code === "auth/wrong-password"
            ? "The password is incorrect"
            : "The email is incorrect";
        this.setState({ errorMessage, showError: true, loading: false });
      });
  };

  // enders modal for user to choose if the user is washer or car owner
  showModal = () => {
    const {
      modalVisible,
      washerChecked,
      ownerChecked,
      userType,
      fcmToken,
    } = this.state;
    return (
      <Modal
        style={{ flex: 1, justifyContent: "center" }}
        isVisible={modalVisible}
        coverScreen
        hasBackdrop
        backdropColor="black"
        backdropOpacity={0.9}
        onBackdropPress={() => this.setState({ modalVisible: false })}
      >
        <CheckBox
          title="Are you car washer?"
          checked={washerChecked}
          onPress={() => {
            this.setState({
              washerChecked: !washerChecked,
              ownerChecked: false,
              userType: true,
            });
          }}
        />
        <CheckBox
          title="Are you car owner?"
          checked={ownerChecked}
          onPress={() => {
            this.setState({
              ownerChecked: !ownerChecked,
              washerChecked: false,
              userType: false,
            });
          }}
        />
        <Button
          buttonStyle={styles.button}
          fontSize={18}
          title="Submit"
          onPress={() => {
            this.setState({ modalVisible: false });
            this.props.navigation.navigate("RegisterProfile", {
              fcmToken,
              userType,
            });
          }}
        />
      </Modal>
    );
  };

  render() {
    const platform = Platform.OS;
    const {
      secureTextEntry,
      fcmToken,
      showError,
      errorMessage,
      loading,
    } = this.state;
    if (loading) return <LoadScreen text="Logging in" />;
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={platform === "android" ? "" : "padding"}
        enabled
      >
        <ImageBackground
          source={require("../../assets/background.png")}
          style={{ flex: 1 }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              style={{
                alignSelf: "center",
                marginTop: 30,
                width: moderateScale(width - 100, 0.1),
                height: moderateScale(height - 400, -0.5),
              }}
              resizeMode="contain"
              source={require("../../assets/logo-shadow.png")}
            />
            <Image
              style={{
                alignSelf: "center",
                width: moderateScale(width - 150, 0.1),
                height: moderateScale(100, -0.1),
              }}
              resizeMode="contain"
              source={require("../../assets/logo-black.png")}
            />
            <Formik
              initialValues={{ email: "", password: "" }}
              onSubmit={async (values) => {
                const { email, password } = values;
                this.handleSubmit(email, password);
                // this.props.login(email, password, fcmToken);
              }}
              validationSchema={yup.object().shape({
                email: yup
                  .string()
                  .email()
                  .required("Please enter correct email"),
                password: yup
                  .string()
                  .min(6)
                  .required("Please enter corret password"),
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
                  <View style={styles.fieldContainer}>
                    <Icon name="user" type="feather" color="black" size={18} />
                    <TextInput
                      style={styles.textInputStyle}
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={() => setFieldTouched("email")}
                      keyboardType="email-address"
                      placeholder="Email"
                      placeholderTextColor="grey"
                    />
                  </View>
                  {touched.email && errors.email && (
                    <Text style={styles.textErrorStyle}>{errors.email}</Text>
                  )}
                  <View style={styles.fieldContainer}>
                    <Icon name="lock" type="feather" color="black" size={18} />
                    <TextInput
                      style={styles.textInputStyle}
                      value={values.password}
                      onChangeText={handleChange("password")}
                      placeholder="Password"
                      placeholderTextColor="grey"
                      onBlur={() => setFieldTouched("password")}
                      secureTextEntry={secureTextEntry}
                    />
                    <Icon
                      name={secureTextEntry ? "eye-off" : "eye"}
                      type="feather"
                      color="black"
                      size={18}
                      onPress={() =>
                        this.setState({ secureTextEntry: !secureTextEntry })
                      }
                    />
                  </View>
                  {touched.password && errors.password && (
                    <Text style={styles.textErrorStyle}>{errors.password}</Text>
                  )}
                  {showError ? (
                    <ErrorMessage errorMessage={errorMessage} marginLeft={40} />
                  ) : null}
                  <TouchableOpacity
                    style={[
                      styles.fieldContainer,
                      {
                        backgroundColor: "black",
                        borderColor: "black",
                        justifyContent: "center",
                      },
                    ]}
                    onPress={handleSubmit}
                    disabled={!isValid}
                    underlayColor="#fff"
                  >
                    <Text style={styles.loginText}>Log In</Text>
                  </TouchableOpacity>
                </Fragment>
              )}
            </Formik>
            {this.showModal()}
            <Button
              title="Forgot password?"
              color="black"
              type="clear"
              titleStyle={{ fontSize: 12, color: "black" }}
              onPress={() => this.props.navigation.navigate("ForgotPassword")}
            />
            <Button
              titleStyle={{ fontSize: 17, color: "black", marginBottom: 30 }}
              title="Don't have an account? Sign Up"
              color="black"
              type="clear"
              onPress={() => this.setState({ modalVisible: true })}
            />
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}
