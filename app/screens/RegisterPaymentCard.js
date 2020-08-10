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
import axios from "axios";
import { connect } from "react-redux";
import { CreditCardInput } from "react-native-credit-card-input";
import stripe from "tipsi-stripe";
import { TextInputMask } from "react-native-masked-text";
import ProgressDot from "../components/ProgressDot";
import ErrorMessage from "../components/Error";
import { ModalLoading } from "../components/LoadScreen";
import { StripeCreateCustomerUrl } from "../config";

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

class RegisterPaymentCard extends Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    errorMessage: "",
    errorMessageVisible: false,
    loadscreen: false,
    valid: false,
    params: {},
  };

  // gets card input and sets the value to state
  getCardDetails = (cardDetails) => {
    console.log(cardDetails);
    const { values, valid } = cardDetails;
    this.setState({ params: values, valid });
  };

  // creates customer in Stripe with the card values provided
  // and adds customer id in firebase database
  createStripeCustomer = () => {
    const { userId } = this.props.user;
    const { params, valid } = this.state;
    if (valid) {
      this.setState({ loadscreen: true });
      const { number, expiry, cvc } = params;
      const formattedCardNumber = number.split(" ").join("");
      const formattedMonthYear = expiry.split("/");
      console.log(formattedCardNumber);
      const cardLastFourDigit = formattedCardNumber.substr(
        formattedCardNumber.length - 4
      );
      const cardDetail = {
        number: formattedCardNumber,
        expMonth: parseInt(formattedMonthYear[0]),
        expYear: parseInt(formattedMonthYear[1]),
        cvc,
      };
      console.log(cardDetail);
      stripe
        .createTokenWithCard(cardDetail)
        .then((tokenResponse) => {
          const { tokenId } = tokenResponse;
          console.log(tokenResponse);
          console.log(tokenId);
          axios
            .post(StripeCreateCustomerUrl, {
              userId,
              token: tokenId,
              cardLastFourDigit,
            })
            .then((response) => {
              console.log(response);
              this.setState({
                loadscreen: false,
                errorMessage: "",
                errorMessageVisible: false,
              });
            })
            .catch((error) => {
              console.log(error);
              this.setState({
                loadscreen: false,
                errorMessage: "Something went wrong. Please try again",
                errorMessageVisible: true,
              });
            });
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            loadscreen: false,
            errorMessage: "Something went wrong. Please try again",
            errorMessageVisible: true,
          });
        });
      return;
    }
    this.setState({
      loadscreen: false,
      errorMessage: "Please fill card details",
      errorMessageVisible: true,
    });
  };

  // updates bank details of the user in firebase database
  registerBankDetails = (values) => {
    const {
      bank,
      address,
      accountNumber,
      sortCode,
      accountHolderName,
    } = values;
    const { userId } = this.props.user;
    this.setState({ loadscreen: true });
    const docRef = firebase.firestore().collection("users").doc(userId);
    const bankDetailObject = {
      bank,
      registeredAddress: address,
      accountNumber,
      sortCode,
      accountHolderName,
    };
    docRef
      .update({ cardRegistered: true, bankDetail: bankDetailObject })
      .then(() =>
        this.setState({
          loadscreen: false,
          errorMessageVisible: false,
          errorMessage: "",
        })
      )
      .catch((err) => {
        this.setState({
          loadscreen: false,
          errorMessage: "Something went wrong. Please try again",
          errorMessageVisible: true,
        });
        console.log(err);
      });
  };

  render() {
    const { userType } = this.props.user;
    const { errorMessage, errorMessageVisible, loadscreen } = this.state;
    const platform = Platform.OS;
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
            <View style={{ paddingTop: 100 }}>
              <ProgressDot index={2} userType={userType} />
              <Text
                style={{
                  alignSelf: "center",
                  marginTop: 30,
                  marginBottom: 30,
                  fontSize: 60,
                }}
              >
                Payment
              </Text>
              {!userType ? (
                <View>
                  {/* <PaymentCardForm cardDetails={this.getCardDetails} /> */}
                  <CreditCardInput onChange={this.getCardDetails} />
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
                    onPress={this.createStripeCustomer}
                    underlayColor="transparent"
                  />
                </View>
              ) : (
                <Formik
                  initialValues={{
                    bank: "",
                    address: "",
                    accountNumber: "",
                    sortCode: "",
                    accountHolderName: "",
                  }}
                  onSubmit={(values) => {
                    // this.createStripeCustomer(values);
                    this.registerBankDetails(values);
                  }}
                  validationSchema={yup.object().shape({
                    bank: yup.string().required("Bank name missing"),
                    address: yup.string().required("Address missing"),
                    accountHolderName: yup
                      .string()
                      .required("Account holder's name missing"),
                    accountNumber: yup
                      .string()
                      .required("Account number missing"),
                    sortCode: yup.string().required("Sort code missing"),
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
                          onChangeText={handleChange("bank")}
                          onBlur={() => setFieldTouched("bank")}
                          value={values.bank}
                          placeholder="Bank"
                          placeholderTextColor="grey"
                        />
                        {touched.bank && errors.bank && (
                          <Text style={styles.textErrorStyle}>
                            {errors.bank}
                          </Text>
                        )}

                        <TextInput
                          style={styles.inputStyle}
                          onChangeText={handleChange("address")}
                          onBlur={() => setFieldTouched("address")}
                          value={values.address}
                          placeholder="Address"
                          placeholderTextColor="grey"
                        />
                        {touched.address && errors.address && (
                          <Text style={styles.textErrorStyle}>
                            {errors.address}
                          </Text>
                        )}

                        <TextInput
                          style={styles.inputStyle}
                          onChangeText={handleChange("accountHolderName")}
                          onBlur={() => setFieldTouched("accountHolderName")}
                          value={values.accountHolderName}
                          placeholder="Account Holder's Name"
                          placeholderTextColor="grey"
                        />
                        {touched.accountHolderName &&
                          errors.accountHolderName && (
                            <Text style={styles.textErrorStyle}>
                              {errors.accountHolderName}
                            </Text>
                          )}

                        <TextInputMask
                          type={"custom"}
                          options={{
                            mask: "99999999",
                          }}
                          style={styles.inputStyle}
                          onChangeText={handleChange("accountNumber")}
                          onBlur={() => setFieldTouched("accountNumber")}
                          value={values.accountNumber}
                          placeholder="Account Number"
                          placeholderTextColor="grey"
                        />
                        {touched.accountNumber && errors.accountNumber && (
                          <Text style={styles.textErrorStyle}>
                            {errors.accountNumber}
                          </Text>
                        )}
                        <TextInputMask
                          type={"custom"}
                          options={{
                            mask: "99-99-99",
                          }}
                          placeholder="Sort code"
                          placeholderTextColor="grey"
                          onChangeText={handleChange("sortCode")}
                          onBlur={() => setFieldTouched("sortCode")}
                          value={values.sortCode}
                          style={styles.inputStyle}
                        />
                        {touched.sortCode && errors.sortCode && (
                          <Text style={styles.textErrorStyle}>
                            {errors.sortCode}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={{
                          alignSelf: "center",
                          paddingTop: 20,
                          paddingBottom: 10,
                        }}
                      >
                        {!userType ? "Finished" : "Next"}
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
              )}
              {errorMessageVisible && (
                <View style={{ alignSelf: "center" }}>
                  <ErrorMessage errorMessage={errorMessage} />
                </View>
              )}
              {loadscreen && <ModalLoading text="Please wait" />}
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

export default connect(mapStateToProps)(RegisterPaymentCard);
