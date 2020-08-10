import React, { Fragment } from "react";
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
import Geocoder from "react-native-geocoding";
import { connect } from "react-redux";
import axios from "axios";
import ProgressDot from "../components/ProgressDot";
import { GOOGLE_API, geo } from "../utils/firebase";
import ErrorMessage from "../components/Error";
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
    marginTop: 15,
  },
});

class RegisterLocation extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    errorMessage: "",
    errorMessageVisible: false,
    loadscreen: false,
  };

  componentDidMount() {
    Geocoder.init(GOOGLE_API);
  }

  // gets formatted location from google api based on location provided
  // and  updates user location on firebase
  registerLocation = (values) => {
    console.log("CHECK");
    this.setState({ loadscreen: true });
    const { houseNumber, street, postCode, city } = values;
    const { userId } = this.props.user;
    const docRef = firebase.firestore().collection("users").doc(userId);
    axios
      .get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          key: GOOGLE_API,
          address: postCode,
          region: "GB",
        },
      })
      .then((res) => {
        const { results } = res.data;
        console.log(res);
        if (results.length === 0) {
          this.setState({
            loadscreen: false,
            errorMessageVisible: true,
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
              // this.setState({ where: result.formatted_address });
              Geocoder.from(result.formatted_address)
                .then((res) => {
                  const { formatted_address, geometry } = res.results[0];
                  const { lat, lng } = geometry.location;
                  const point = new firebase.firestore.GeoPoint(lat, lng);
                  const getHash = geo.point(lat, lng);
                  console.log(formatted_address);
                  const locationDetailObject = {
                    houseName: houseNumber,
                    street,
                    postcode: postCode,
                    city,
                    latitude: lat,
                    longitude: lng,
                    formatted_address,
                    geopoint: point,
                    geohash: getHash.hash,
                  };
                  return docRef
                    .update({
                      locationRegistered: true,
                      location: locationDetailObject,
                    })
                    .then(() =>
                      this.setState({
                        loadscreen: false,
                        errorMessageVisible: false,
                        errorMessage: "",
                      })
                    )
                    .catch((err) => {
                      console.log(err);
                      this.setState({
                        loadscreen: false,
                        errorMessageVisible: true,
                        errorMessage: "Something went wrong. Please try again",
                      });
                    });
                })
                .catch((err) => {
                  this.setState({
                    loadscreen: false,
                    errorMessageVisible: true,
                    errorMessage: "Something went wrong. Please try again",
                  });
                  console.log(err);
                });
            })
            .catch((er) => {
              this.setState({
                loadscreen: false,
                errorMessageVisible: true,
                errorMessage: "Something went wrong. Please try again",
              });
              console.log(er);
            });
        });
      })
      .catch((err) => {
        this.setState({
          loadscreen: false,
          errorMessageVisible: true,
          errorMessage: "Something went wrong. Please try again",
        });
        console.log(err);
      });
  };

  render() {
    const { userType } = this.props.user;
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
              <ProgressDot index={1} userType={userType} />
              <Text
                style={{
                  alignSelf: "center",
                  marginTop: 30,
                  marginBottom: 30,
                  fontSize: 60,
                }}
              >
                Location
              </Text>

              <Formik
                initialValues={{
                  houseNumber: "",
                  street: "",
                  postCode: "",
                  city: "",
                }}
                onSubmit={(values) => {
                  this.registerLocation(values);
                }}
                validationSchema={yup.object().shape({
                  houseNumber: yup.string().required("House number missing"),
                  street: yup.string().required("Street name missing"),
                  postCode: yup.string().required("Postcode missing"),
                  city: yup.string().required("City/Town name missing"),
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
                        value={values.houseNumber}
                        onChangeText={handleChange("houseNumber")}
                        onBlur={() => setFieldTouched("houseNumber")}
                        placeholder="House Name/Number"
                        placeholderTextColor="grey"
                      />
                      {touched.houseNumber && errors.houseNumber && (
                        <Text style={styles.textErrorStyle}>
                          {errors.houseNumber}
                        </Text>
                      )}
                      <TextInput
                        style={styles.inputStyle}
                        value={values.street}
                        onChangeText={handleChange("street")}
                        onBlur={() => setFieldTouched("street")}
                        placeholder="Street"
                        placeholderTextColor="grey"
                      />
                      {touched.street && errors.street && (
                        <Text style={styles.textErrorStyle}>
                          {errors.street}
                        </Text>
                      )}
                      <TextInput
                        style={styles.inputStyle}
                        value={values.postCode}
                        onChangeText={handleChange("postCode")}
                        onBlur={() => setFieldTouched("postCode")}
                        placeholder="Postcode"
                        placeholderTextColor="grey"
                      />
                      {touched.postCode && errors.postCode && (
                        <Text style={styles.textErrorStyle}>
                          {errors.postCode}
                        </Text>
                      )}
                      <TextInput
                        style={styles.inputStyle}
                        value={values.password}
                        onChangeText={handleChange("city")}
                        placeholder="City/Town"
                        placeholderTextColor="grey"
                        onBlur={() => setFieldTouched("city")}
                      />
                      {touched.city && errors.city && (
                        <Text style={styles.textErrorStyle}>{errors.city}</Text>
                      )}
                    </View>

                    {errorMessageVisible && (
                      <ErrorMessage
                        errorMessage={errorMessage}
                        marginLeft={10}
                      />
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
                          marginBottom: 10,
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
const mapStateToProps = ({ checkUser }) => {
  const { user } = checkUser;
  console.log("MAP RED", user);
  return {
    user,
  };
};

export default connect(mapStateToProps)(RegisterLocation);
