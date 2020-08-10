import React, { Fragment } from 'react';
import {
  View, TextInput, StyleSheet, Alert, Platform,
  KeyboardAvoidingView, ScrollView, Dimensions,
  ImageBackground, Image, TouchableOpacity,
  Text,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import firebase from 'react-native-firebase';
import { Formik } from "formik";
import * as yup from "yup";
import colors from '../style';

var { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#001331',
  },
  loginText: {
    color: "white",
    textAlign: "center",
    alignSelf: 'center',
    fontSize: 20
  },
  textErrorStyle: {
    fontSize: 10,
    color: "red",
    marginLeft: 40,
  },
  fieldContainer: {
    flexDirection: 'row',
    margin: 10,
    marginLeft: 40,
    marginRight: 40,
    borderRadius: 50,
    borderColor: 'white',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 2,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  textInputStyle: {
    flex: 1,
    height: 40,
    color: 'black',
    marginLeft: 10,
    fontSize: 18,
  },
});


export default class ForgotPassword extends React.Component {
  static navigationOptions = {
    title: 'Reset Password',
    headerStyle: {
      backgroundColor: colors.accent,
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 20,
    },
  };

  state = {
    email: '',
    showError: false,
    error: '',
    showLoading: false,
    showModal: false,
  }

  // takes user email and sends password link to the email provided
  handleSubmit = (email) => {
    firebase.auth().sendPasswordResetEmail(email).then(() => {
      this.props.navigation.navigate('Login');
      Alert.alert('Password reset link has been sent to your email');
    }).catch((error) => {
      Alert.alert('Something went wrong');
    });
  }

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'android' ? '' : 'padding'} enabled>
        <ImageBackground
          source={require("../../assets/background.png")}
          style={{ flex: 1 }}
        >
          <ScrollView>
          <Image
              style={{
                alignSelf: "center",
                marginTop: 50,
                width: moderateScale(width - 100, 0.1),
                height: moderateScale(height - 400, -0.4)
              }}
              resizeMode="contain"
              source={require("../../assets/logo-shadow.png")}
          />
          <Image
              style={{
                alignSelf: "center",
                width: moderateScale(width - 150, 0.1),
                height: moderateScale(100, -0.1)
              }}
              resizeMode="contain"
              source={require("../../assets/logo-black.png")}
            />
          <Formik
            initialValues={{ email: "" }}
            onSubmit={async values => {
              const { email } = values;
              this.handleSubmit(email);
            }}
            validationSchema={yup.object().shape({
              email: yup
                .string()
                .email()
                .required("Please enter correct email"),
            })}
          >
            {({
              values,
              handleChange,
              errors,
              setFieldTouched,
              touched,
              isValid,
              handleSubmit
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
                />
                </View>
                {touched.email && errors.email && (
                  <Text style={styles.textErrorStyle}>
                    {errors.email}
                  </Text>
                )}
                <TouchableOpacity
                  style={[styles.fieldContainer,
                    { backgroundColor: 'black', borderColor: 'black', justifyContent: 'center' }
                  ]}
                  onPress={handleSubmit}
                  disabled={!isValid}
                  underlayColor="#fff"
                >
                  <Text style={styles.loginText}>Submit</Text>
                </TouchableOpacity>
              </Fragment>
            )}
          </Formik>
          </ScrollView>
        </ImageBackground>
        </KeyboardAvoidingView>
    );
  }
}
