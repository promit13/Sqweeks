import React, { Fragment } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  ImageBackground,
  ScrollView,
  Platform,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import { CreditCardInput } from "react-native-credit-card-input";
import { connect } from "react-redux";
import { Formik } from "formik";
import * as yup from "yup";
import { TextInputMask } from "react-native-masked-text";
import firebase from "firebase";
import Geocoder from "react-native-geocoding";
import axios from "axios";
import stripe from "tipsi-stripe";
import { GOOGLE_API, geo } from "../utils/firebase";
import colors from "../style";
import { ModalLoading } from "../components/LoadScreen";
import ShowModal from "../components/ShowModal";
import ErrorMessage from "../components/Error";
import { StripeCreateCustomerUrl } from "../config";

const styles = {
  textErrorStyle: {
    fontSize: 10,
    color: "red",
    marginLeft: 10,
  },
  inputStyle: {
    borderColor: "#707070",
    alignItems: "center",
    height: 60,
    borderWidth: 0.1,
    padding: 10,
    fontSize: 20,
  },
  buttonStyle: {
    backgroundColor: colors.accent,
    marginTop: 5,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
    padding: 10,
  },
  containerStyle: {
    flex: 3,
    height: 60,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
  },
  inputContainerStyle: {
    flex: 2.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textStyle: {
    margin: 10,
    fontSize: 16,
  },
};

class EditProfile extends React.Component {
  state = {
    showEditBasic: true,
    showEditCard: true,
    loading: false,
    showModal: false,
    modalText: "",
    valid: false,
    params: {},
    showError: true,
    errorMessage: "",
    cardLastFourDigit: "",
  };

  componentDidMount() {
    Geocoder.init(GOOGLE_API);
  }

  // either updates firebase database with the new bank details provided.
  // Or, gets formatted address from google api based on new location provided
  // and updates location in firebase database.
  handleSave = (values, check) => {
    this.setState({ loading: true });
    const { userId, userType } = this.props.user;
    const docRef = firebase.firestore().collection("users").doc(userId);
    if (check) {
      const { name, about, town, post, house, streetName } = values;
      axios
        .get("https://maps.googleapis.com/maps/api/geocode/json", {
          params: {
            key: GOOGLE_API,
            address: post,
            region: "GB",
          },
        })
        .then((res) => {
          const { results } = res.data;
          console.log(res);
          if (results.length === 0) {
            this.setState({
              loading: false,
              showError: true,
              errorMessage: "Please enter correct postcode",
            });
            return;
          }
          results.forEach((result) => {
            axios
              .get("https://maps.googleapis.com/maps/api/place/details/json", {
                params: {
                  key: GOOGLE_API,
                  placeid: result.place_id,
                  inputtype: "textquery",
                  region: "GB",
                  fields: "formatted_address,geometry,name,photos",
                },
              })
              .then((place) => {
                const { result } = place.data;
                Geocoder.from(result.formatted_address)
                  .then((res) => {
                    const { formatted_address, geometry } = res.results[0];
                    const { lat, lng } = geometry.location;
                    const point = new firebase.firestore.GeoPoint(lat, lng);
                    const getHash = geo.point(lat, lng);
                    console.log(res.results[0]);
                    console.log(getHash);
                    const locationDetailObject = {
                      houseName: house,
                      street: streetName,
                      postcode: post,
                      city: town,
                      latitude: lat,
                      longitude: lng,
                      formatted_address,
                      geopoint: point,
                      geohash: getHash.hash,
                    };
                    return docRef
                      .update({
                        fullName: name,
                        aboutMe: about,
                        location: locationDetailObject,
                      })
                      .then(() => {
                        this.setState({
                          showEditBasic: false,
                          loading: false,
                          showModal: true,
                          showError: false,
                          errorMessage: "",
                          modalText: "Account updated",
                        });
                      })
                      .catch((err) => {
                        console.log(err);
                        this.setState({
                          loading: false,
                          showError: true,
                          errorMessage:
                            "Something went wrong. Please try again.",
                        });
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    this.setState({
                      loading: false,
                      showError: true,
                      errorMessage: "Something went wrong. Please try again.",
                    });
                  });
              })
              .catch((er) => {
                console.log(er);
                this.setState({
                  loading: false,
                  showError: true,
                  errorMessage: "Something went wrong. Please try again.",
                });
              });
          });
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            loading: false,
            showError: true,
            errorMessage: "Something went wrong. Please try again.",
          });
        });
    } else {
      const {
        bank,
        address,
        accountNumber,
        sortCode,
        accountHolderName,
      } = values;
      const bankDetail = {
        bank,
        registeredAddress: address,
        accountNumber,
        sortCode,
        accountHolderName,
      };

      console.log(bankDetail);
      docRef
        .update({
          bankDetail,
        })
        .then(() => {
          this.setState({
            showEditCard: false,
            loading: false,
            showModal: true,
            modalText: "Bank detail updated",
          });
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            loading: false,
            showError: true,
            errorMessage: "Something went wrong. Please try again.",
          });
        });
    }
  };

  // renders form to input users personal details to edit
  editBasic = () => {
    const { fullName, location, aboutMe, userType } = this.props.user;
    const { city, postcode, houseName, street } = location;
    const { showError, errorMessage } = this.state;
    return (
      <View style={{ backgroundColor: "white" }}>
        <Formik
          initialValues={{
            name: fullName,
            about: aboutMe,
            town: city,
            post: postcode,
            streetName: street,
            house: houseName,
          }}
          onSubmit={(values) => {
            this.handleSave(values, true);
          }}
          validationSchema={yup.object().shape({
            name: yup.string().required("Enter full name"),
            town: yup.string().required("Enter town"),
            post: yup.string().required("Enter postcode"),
            house: yup.string().required("Enter house name or number"),
            streetName: yup.string().required("Enter street name"),
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
                  placeholder="Full Name"
                  placeholderTextColor="grey"
                />
                {touched.name && errors.name && (
                  <Text style={styles.textErrorStyle}>{errors.name}</Text>
                )}
                {userType ? (
                  <TextInput
                    style={styles.inputStyle}
                    value={values.about}
                    onChangeText={handleChange("about")}
                    onBlur={() => setFieldTouched("about")}
                    multiline={true}
                    placeholder="About you"
                    placeholderTextColor="grey"
                  />
                ) : null}
                {touched.about && errors.about && (
                  <Text style={styles.textErrorStyle}>{errors.about}</Text>
                )}
                <TextInput
                  style={styles.inputStyle}
                  value={values.town}
                  onChangeText={handleChange("town")}
                  onBlur={() => setFieldTouched("town")}
                  placeholder="Town"
                  placeholderTextColor="grey"
                />
                {touched.town && errors.town && (
                  <Text style={styles.textErrorStyle}>{errors.town}</Text>
                )}
                <TextInput
                  style={styles.inputStyle}
                  value={values.post}
                  onChangeText={handleChange("post")}
                  onBlur={() => setFieldTouched("post")}
                  placeholder="Post code"
                  placeholderTextColor="grey"
                />
                {touched.post && errors.post && (
                  <Text style={styles.textErrorStyle}>{errors.post}</Text>
                )}
                <TextInput
                  style={styles.inputStyle}
                  value={values.house}
                  onChangeText={handleChange("house")}
                  onBlur={() => setFieldTouched("house")}
                  placeholder="House name/number"
                  placeholderTextColor="grey"
                />
                {touched.house && errors.house && (
                  <Text style={styles.textErrorStyle}>{errors.house}</Text>
                )}
                <TextInput
                  style={styles.inputStyle}
                  value={values.streetName}
                  onChangeText={handleChange("streetName")}
                  onBlur={() => setFieldTouched("streetName")}
                  placeholder="Street name"
                  placeholderTextColor="grey"
                />
                {touched.streetName && errors.streetName && (
                  <Text style={styles.textErrorStyle}>{errors.streetName}</Text>
                )}
              </View>
              {showError && (
                <ErrorMessage errorMessage={errorMessage} marginLeft={10} />
              )}
              <Button
                buttonStyle={styles.buttonStyle}
                title="Save"
                titleStyle={{ color: "white", fontSize: 20 }}
                onPress={handleSubmit}
              />
            </Fragment>
          )}
        </Formik>
      </View>
    );
  };

  // get card values and sets value to state
  getCardDetails = (cardDetails) => {
    console.log(cardDetails);
    const { values, valid } = cardDetails;
    this.setState({ params: values, valid });
  };

  // create stripe customer with the card value provided
  createStripeCustomer = () => {
    const { userId } = this.props.user;
    const { params, valid } = this.state;
    if (valid) {
      this.setState({ loading: true });
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
              userId: userId,
              token: tokenId,
              cardLastFourDigit,
            })
            .then((response) => {
              console.log(response);
              this.setState({
                showEditCard: false,
                loading: false,
                showModal: true,
                modalText: "Card updated",
                errorMessage: "",
                showError: false,
              });
            })
            .catch((err) => {
              console.log(err);
              this.setState({
                loading: false,
                showError: true,
                errorMessage: "Something went wrong. Please try again.",
              });
            });
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            loading: false,
            showError: true,
            errorMessage: "Something went wrong. Please try again.",
          });
        });
    } else {
      this.setState({
        loading: false,
        showError: true,
        errorMessage: "Please complete your card details",
      });
    }
  };

  // renders card form if the user is a car owner.
  // Otherwise, renders form to input bank details to edit
  editCard = () => {
    const { userType, bankDetail, cardLastFourDigit } = this.props.user;
    const { showError, errorMessage } = this.state;
    if (!userType) {
      return (
        <View style={{ backgroundColor: "white" }}>
          <Text
            style={styles.textStyle}
          >{`Current card: **** **** **** ${cardLastFourDigit}`}</Text>
          <Text
            style={{ fontSize: 16, fontWeight: "bold", alignSelf: "center" }}
          >
            Add New Card
          </Text>
          <CreditCardInput onChange={this.getCardDetails} />
          {showError && (
            <ErrorMessage errorMessage={errorMessage} marginLeft={10} />
          )}
          <Button
            buttonStyle={styles.buttonStyle}
            title="Save"
            titleStyle={{ color: "white", fontSize: 20 }}
            onPress={() => this.createStripeCustomer()}
          />
        </View>
      );
    }
    console.log(userType, bankDetail);
    const {
      registeredAddress,
      bank,
      accountNumber,
      sortCode,
      accountHolderName,
    } = bankDetail;
    return (
      <View style={{ backgroundColor: "white" }}>
        <Formik
          initialValues={{
            bank,
            address: registeredAddress,
            accountNumber,
            sortCode,
            accountHolderName,
          }}
          onSubmit={(values) => {
            this.handleSave(values);
          }}
          validationSchema={yup.object().shape({
            bank: yup.string().required("Bank name missing"),
            address: yup.string().required("Address missing"),
            accountHolderName: yup
              .string()
              .required("Account holder's name missing"),
            accountNumber: yup.string().required("Account number missing"),
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
                  <Text style={styles.textErrorStyle}>{errors.bank}</Text>
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
                  <Text style={styles.textErrorStyle}>{errors.address}</Text>
                )}

                <TextInput
                  style={styles.inputStyle}
                  onChangeText={handleChange("accountHolderName")}
                  onBlur={() => setFieldTouched("accountHolderName")}
                  value={values.accountHolderName}
                  placeholder="Account Holder's Name"
                  placeholderTextColor="grey"
                />
                {touched.accountHolderName && errors.accountHolderName && (
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
                  onChangeText={handleChange("sortCode")}
                  onBlur={() => setFieldTouched("sortCode")}
                  value={values.sortCode}
                  style={styles.inputStyle}
                  placeholderTextColor="grey"
                />
                {touched.sortCode && errors.sortCode && (
                  <Text style={styles.textErrorStyle}>{errors.sortCode}</Text>
                )}
              </View>
              {showError && (
                <ErrorMessage errorMessage={errorMessage} marginLeft={10} />
              )}
              <Button
                buttonStyle={styles.buttonStyle}
                title="Save"
                titleStyle={{ color: "white", fontSize: 20 }}
                onPress={handleSubmit}
              />
            </Fragment>
          )}
        </Formik>
      </View>
    );
  };

  render() {
    const {
      showEditBasic,
      showEditCard,
      loading,
      showModal,
      modalText,
    } = this.state;
    const { userType } = this.props.user;
    const platform = Platform.OS;
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={platform === "android" ? "" : "padding"}
        enabled
      >
        <ImageBackground
          source={require("../../assets/background.png")}
          style={{ width: "100%", height: "100%" }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 10,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                {!showEditBasic ? (
                  <Icon
                    name="circle-with-plus"
                    type="entypo"
                    color="black"
                    size={24}
                    onPress={() =>
                      this.setState({ showEditBasic: !showEditBasic })
                    }
                  />
                ) : (
                  <Icon
                    name="circle-with-minus"
                    type="entypo"
                    color="black"
                    size={24}
                    onPress={() =>
                      this.setState({ showEditBasic: !showEditBasic })
                    }
                  />
                )}

                <Text
                  style={{ fontSize: 20, marginLeft: 10, fontWeight: "bold" }}
                >
                  Personal Details
                </Text>
              </View>
              {!showEditBasic ? (
                <Icon
                  style={{ alignSelf: "flex-end" }}
                  name="ios-arrow-up"
                  type="ionicon"
                  color="black"
                  size={24}
                />
              ) : (
                <Icon
                  style={{ alignSelf: "flex-end" }}
                  name="ios-arrow-down"
                  type="ionicon"
                  color="black"
                  size={24}
                />
              )}
            </View>
            {showEditBasic && this.editBasic()}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 10,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                {!showEditCard ? (
                  <Icon
                    name="circle-with-plus"
                    type="entypo"
                    color="black"
                    size={24}
                    onPress={() =>
                      this.setState({ showEditCard: !showEditCard })
                    }
                  />
                ) : (
                  <Icon
                    name="circle-with-minus"
                    type="entypo"
                    color="black"
                    size={24}
                    onPress={() =>
                      this.setState({ showEditCard: !showEditCard })
                    }
                  />
                )}
                <Text
                  style={{ fontSize: 20, marginLeft: 10, fontWeight: "bold" }}
                >
                  {userType ? "Bank Details" : "Change card"}
                </Text>
              </View>
              {!showEditCard ? (
                <Icon
                  style={{ alignSelf: "flex-end" }}
                  name="ios-arrow-up"
                  type="ionicon"
                  color="black"
                  size={24}
                />
              ) : (
                <Icon
                  style={{ alignSelf: "flex-end" }}
                  name="ios-arrow-down"
                  type="ionicon"
                  color="black"
                  size={24}
                />
              )}
            </View>
            {showEditCard && this.editCard()}
            {loading && <ModalLoading text="Please wait" />}
            {showModal && (
              <ShowModal
                showModal={showModal}
                onPress={() => this.setState({ showModal: false })}
                modalText={modalText}
              />
            )}
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}
const mapStateToProps = ({ checkUser }) => {
  const { user } = checkUser;
  console.log("MAP EDIT PROFILE", user);
  return {
    user,
  };
};

export default connect(mapStateToProps)(EditProfile);
