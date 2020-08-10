import React, { Component, Fragment } from "react";
import {
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  Dimensions,
  View,
  ImageBackground,
  Image,
  Platform,
  ActivityIndicator
} from "react-native";
import { Button, Icon, Text, CheckBox } from "react-native-elements";
import { Formik } from "formik";
import * as yup from "yup";
import firebase from "react-native-firebase";
import ImagePicker from "react-native-image-crop-picker";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import RNPickerSelect from "react-native-picker-select";
import Geocoder from "react-native-geocoding";
import axios from "axios";
import DateTimePicker from "react-native-modal-datetime-picker";
import ProgressDot from "../components/ProgressDot";
import { GOOGLE_API, geo } from "../utils/firebase";
import ErrorMessage from "../components/Error";
import colors from "../style";

import LoadScreen, { ModalLoading } from "../components/LoadScreen";

var { height, width } = Dimensions.get("window");

const styles = StyleSheet.create({
  inputStyle: {
    height: 70,
    backgroundColor: "white",
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 1,
    fontSize: 20
  },
  loginScreenButton: {
    width: width - 20,
    marginTop: 10,
    height: 56,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "white",
    borderWidth: 4,
    borderColor: "black",
    marginLeft: 10
  },
  loginText: {
    textAlign: "center",
    height: 50,
    paddingLeft: 10,
    paddingRight: 10
  },
  textErrorStyle: {
    fontSize: 16,
    color: "red"
  },
  textStyle: {
    fontSize: 16,
    color: "grey"
  },
  containerStyle: {
    flex: 3,
    height: 60,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10
  },
  inputContainerStyle: {
    flex: 2.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dayTextStyle: {
    flex: 0.8,
    fontSize: 20
  },
  imageStyle: {
    height: 100,
    width: 100,
    marginBottom: 10
  },
  crbContainer: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center"
  },
  crbTextStyle: {
    fontSize: 20,
    flex: 1.5
  },
  crbInnerContainer: {
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  circleBackground: {
    alignSelf: "center",
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    justifyContent: "center"
  }
});

const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    color: "black" // to ensure the text is never behind the icon
  }
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
  { label: "23:00:00", value: "23:00:00" }
];
let imagesDownloadUrl = [];
export default class Register extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerStyle: {
        backgroundColor: colors.accent
      }
    };
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
    loadscreen: false
  };

  componentDidMount() {
    Geocoder.init(GOOGLE_API);
  }

  registerProfile = (index, name, surname, email, password) => {
    console.log("CHECK");
    this.setState({ loadscreen: true });
    if (index === "1") {
      const { fcmToken, userType } = this.props;
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
        agreementAccepted: false
      };
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(user => {
          const { uid } = user.user;
          firebase
            .firestore()
            .collection("users")
            .doc(uid)
            .set(userDetails);
          this.setState({
            errorMessage: "",
            errorMessageVisible: false,
            loadscreen: false
          });
        })
        .catch(error => {
          this.setState({
            errorMessage: error.message,
            errorMessageVisible: true,
            loadscreen: false
          });
          console.log(error);
        });
    } else {
      const { uid } = this.props.user;
      console.log("uid", index, uid);
      const docRef = firebase
        .firestore()
        .collection("users")
        .doc(uid);
      if (index === "2") {
        axios
          .get("https://maps.googleapis.com/maps/api/geocode/json", {
            params: {
              key: GOOGLE_API,
              address: email,
              region: "GB"
            }
          })
          .then(res => {
            const { results } = res.data;
            console.log(res);
            results.forEach(result => {
              axios
                .get(
                  "https://maps.googleapis.com/maps/api/place/details/json",
                  {
                    params: {
                      key: GOOGLE_API,
                      placeid: result.place_id,
                      inputtype: "textquery",
                      region: "GB",
                      fields: "formatted_address,geometry,name,photos"
                    }
                  }
                )
                .then(place => {
                  const { result } = place.data;
                  // this.setState({ where: result.formatted_address });
                  Geocoder.from(result.formatted_address)
                    .then(res => {
                      const { formatted_address, geometry } = res.results[0];
                      const { lat, lng } = geometry.location;
                      const point = new firebase.firestore.GeoPoint(lat, lng);
                      const getHash = geo.point(lat, lng);
                      console.log(formatted_address);
                      const locationDetailObject = {
                        houseName: name,
                        street: surname,
                        postcode: email,
                        city: password,
                        latitude: lat,
                        longitude: lng,
                        formatted_address,
                        geopoint: point,
                        geohash: getHash.hash
                      };
                      return docRef
                        .update({
                          locationRegistered: true,
                          location: locationDetailObject
                        })
                        .then(() => this.setState({ loadscreen: false }))
                        .catch(err => {
                          console.log(err);
                          this.setState({ loadscreen: false });
                        });
                    })
                    .catch(err => {
                      this.setState({ loadscreen: false });
                      console.log(err);
                    });
                })
                .catch(er => {
                  this.setState({ loadscreen: false });
                  console.log(er);
                });
            });
          })
          .catch(err => {
            this.setState({ loadscreen: false });
            console.log(err);
          });
      } else if (index === "3") {
        const { userType } = this.props;
        console.log(userType);
        console.log(name, surname, email, password);
        const cardDetailObject = userType
          ? {
              bank: name,
              accountNumber: surname,
              sortCode: email,
              registeredAddress: password
            }
          : {
              cardNumber: name,
              registeredAddress: surname,
              expiryDate: email,
              cvv: password
            };
        docRef
          .update({ cardRegistered: true, cardDetail: cardDetailObject })
          .then(() => this.setState({ loadscreen: false }))
          .catch(err => {
            this.setState({ loadscreen: false });
            console.log(err);
          });
      }
    }
  };

  submitWorkingHours = () => {
    this.setState({ loadscreen: true });
    const { uid } = this.props.user;
    const {
      mondayStartTime,
      mondayEndTime,
      tuesdayStarTime,
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
      sundayEndTime
    } = this.state;
    const scheduleArray = [
      {
        Monday: [mondayStartTime, mondayEndTime],
        Tuesday: [tuesdayStarTime, tuesdayEndTime],
        Wednesday: [wednesdayStarTime, wednesdayEndTime],
        Thursday: [thursdayStarTime, thursdayEndTime],
        Friday: [fridayStarTime, fridayEndTime],
        Saturday: [saturdayStarTime, saturdayEndTime],
        Sunday: [sundayStarTime, sundayEndTime]
      }
    ];
    console.log(scheduleArray);
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .update({
        workingHours: scheduleArray,
        workingHoursSet: true
      })
      .then(() => this.setState({ loadscreen: false }))
      .catch(err => {
        this.setState({ loadscreen: false });
        console.log(err);
      });
  };

  updateCrbInFirebase = () => {
    const { uid } = this.props.user;
    const { niNumber } = this.state;
    console.log("uid", uid);
    const crbDetail = {
      passport: imagesDownloadUrl[0],
      lisence: imagesDownloadUrl[1],
      insurance: imagesDownloadUrl[2],
      niNumber
    };
    firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .update({
        crbDetail,
        crbChecked: true
      })
      .then(() => {
        this.setState({ loadscreen: false });
        imagesDownloadUrl = [];
      })
      .catch(err => {
        console.log(err);
        this.setState({ loadscreen: false });
        imagesDownloadUrl = [];
      });
  };

  uploadImageToFirebase = (images, index) => {
    const { uid } = this.props.user;
    console.log("uid", uid);
    const path = images[index];
    const filename =
      index === 0 ? "passport" : index === 1 ? "lisence" : "insurance";
    firebase
      .storage()
      .ref()
      .child(`${uid}/${filename}`)
      .put(path)
      .then(response => {
        const { downloadURL } = response;
        console.log(downloadURL);
        imagesDownloadUrl.push(downloadURL);
        if (index === images.length - 1) {
          this.updateCrbInFirebase();
          return;
        }
        // this.saveImage(path);
        this.uploadImageToFirebase(images, index + 1);
      })
      .catch(err => console.log(err));
  };

  uploadImages = () => {
    let images = [];
    const { passportUrl, lisenceUrl, insuranceUrl, niNumber } = this.state;
    if (passportUrl === "") {
      this.setState({
        errorMessage: "Please upload your passport",
        errorMessageVisible: true
      });
      return;
    }
    if (lisenceUrl === "") {
      this.setState({
        errorMessage: "Please upload your lisence",
        errorMessageVisible: true
      });
      return;
    }
    if (insuranceUrl === "") {
      this.setState({
        errorMessage: "Please upload your insurance",
        errorMessageVisible: true
      });
      return;
    }
    if (niNumber === "") {
      this.setState({
        errorMessage: "Please enter your NI number",
        errorMessageVisible: true
      });
      return;
    }
    this.setState({
      loadscreen: true,
      errorMessage: "",
      errorMessageVisible: false
    });
    images = [passportUrl, lisenceUrl, insuranceUrl];
    this.uploadImageToFirebase(images, 0);
  };

  setImageUrl = (index, image) => {
    if (index === 1) {
      this.setState({ passportUrl: image.path });
    } else if (index === 2) {
      this.setState({ lisenceUrl: image.path });
    } else {
      this.setState({ insuranceUrl: image.path });
    }
  };

  openCamera = async index => {
    const { userId } = this.props.user;
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true
    }).then(image => {
      const newImageName = `${moment().format("DDMMYY_HHmmSSS")}.jpg`;
      this.setImageUrl(index, image);
    });
  };

  pickImage = index => {
    ImagePicker.openPicker({
      multiple: false
    }).then(image => {
      this.setImageUrl(index, image);
    });
  };

  renderCrbView = () => {
    const { passportUrl, lisenceUrl, insuranceUrl, niNumber } = this.state;
    return (
      <View style={{ flex: 1, backgroundColor: "white", padding: 20 }}>
        <View style={styles.crbContainer}>
          <Text style={styles.crbTextStyle}>Passport</Text>
          <View style={styles.crbInnerContainer}>
            <Icon
              name="upload"
              type="feather"
              size={30}
              onPress={() => {
                this.pickImage(1);
              }}
            />
            <Icon
              name="camera"
              type="feather"
              size={30}
              onPress={() => {
                this.openCamera(1);
              }}
            />
            <Image
              resizeMode="contain"
              style={styles.imageStyle}
              source={{ uri: passportUrl }}
            />
          </View>
        </View>
        <View style={styles.crbContainer}>
          <Text style={styles.crbTextStyle}>Driving Licence</Text>
          <View style={styles.crbInnerContainer}>
            <Icon
              name="upload"
              type="feather"
              size={30}
              onPress={() => {
                this.pickImage(2);
              }}
            />
            <Icon
              name="camera"
              type="feather"
              size={30}
              onPress={() => {
                this.openCamera(2);
              }}
            />
            <Image
              resizeMode="contain"
              style={styles.imageStyle}
              source={{ uri: lisenceUrl }}
            />
          </View>
        </View>
        <View style={styles.crbContainer}>
          <Text style={styles.crbTextStyle}>Liability Insurance</Text>
          <View style={styles.crbInnerContainer}>
            <Icon
              name="upload"
              type="feather"
              size={30}
              onPress={() => {
                this.pickImage(3);
              }}
            />
            <Icon
              name="camera"
              type="feather"
              size={30}
              onPress={() => {
                this.openCamera(3);
              }}
            />
            <Image
              resizeMode="contain"
              style={styles.imageStyle}
              source={{ uri: insuranceUrl }}
            />
          </View>
        </View>
        <TextInput
          style={styles.inputStyle}
          placeholder="NI Number"
          placeholderTextColor={"black"}
          onChangeText={text => this.setState({ niNumber: text })}
          value={niNumber}
        />
        {/* { loading && <ActivityIndicator /> } */}
        {/* { errorMessageVisible && <ErrorMessage errorMessage={errorMessage} /> } */}
      </View>
    );
  };

  renderBookScheduleView = () => {
    const { mondayStartTime } = this.state;
    console.log(mondayStartTime);
    return (
      <View>
        <View style={styles.containerStyle}>
          <Text style={styles.dayTextStyle}>Monday</Text>
          <View style={styles.inputContainerStyle}>
            <Text style={styles.textStyle}>START</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value => this.setState({ mondayStartTime: value })}
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
            <View style={{ height: 20, width: 1, backgroundColor: "red" }} />
            <Text style={styles.textStyle}>END</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value => this.setState({ mondayEndTime: value })}
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
          </View>
        </View>
        <View style={styles.containerStyle}>
          <Text style={styles.dayTextStyle}>Tuesday</Text>
          <View style={styles.inputContainerStyle}>
            <Text style={styles.textStyle}>START</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value => this.setState({ tuesdayStarTime: value })}
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
            <View style={{ height: 20, width: 1, backgroundColor: "red" }} />
            <Text style={styles.textStyle}>END</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value => this.setState({ tuesdayEndTime: value })}
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
          </View>
        </View>
        <View style={styles.containerStyle}>
          <Text style={styles.dayTextStyle}>Wednesday</Text>
          <View style={styles.inputContainerStyle}>
            <Text style={styles.textStyle}>START</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value =>
                this.setState({ wednesdayStarTime: value })
              }
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
            <View style={{ height: 20, width: 1, backgroundColor: "red" }} />
            <Text style={styles.textStyle}>END</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value =>
                this.setState({ wednesdayEndTime: value })
              }
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
          </View>
        </View>
        <View style={styles.containerStyle}>
          <Text style={styles.dayTextStyle}>Thursday</Text>
          <View style={styles.inputContainerStyle}>
            <Text style={styles.textStyle}>START</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value =>
                this.setState({ thursdayStarTime: value })
              }
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
            <View style={{ height: 20, width: 1, backgroundColor: "red" }} />
            <Text style={styles.textStyle}>END</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value => this.setState({ thursdayEndTime: value })}
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
          </View>
        </View>
        <View style={styles.containerStyle}>
          <Text style={styles.dayTextStyle}>Friday</Text>
          <View style={styles.inputContainerStyle}>
            <Text style={styles.textStyle}>START</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value => this.setState({ fridayStarTime: value })}
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
            <View style={{ height: 20, width: 1, backgroundColor: "red" }} />
            <Text style={styles.textStyle}>END</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value => this.setState({ fridayEndTime: value })}
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
          </View>
        </View>
        <View style={styles.containerStyle}>
          <Text style={styles.dayTextStyle}>Saturday</Text>
          <View style={styles.inputContainerStyle}>
            <Text style={styles.textStyle}>START</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value =>
                this.setState({ saturdayStarTime: value })
              }
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
            <View style={{ height: 20, width: 1, backgroundColor: "red" }} />
            <Text style={styles.textStyle}>END</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value => this.setState({ saturdayEndTime: value })}
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
          </View>
        </View>
        <View style={styles.containerStyle}>
          <Text style={styles.dayTextStyle}>Sunday</Text>
          <View style={styles.inputContainerStyle}>
            <Text style={styles.textStyle}>START</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value => this.setState({ sundayStarTime: value })}
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
            <View style={{ height: 20, width: 1, backgroundColor: "red" }} />
            <Text style={styles.textStyle}>END</Text>
            <RNPickerSelect
              placeholder={{ label: "None", value: null }}
              onValueChange={value => this.setState({ sundayEndTime: value })}
              items={pickerItems}
              useNativeAndroidPickerStyle={false}
              style={pickerSelectStyles}
            />
          </View>
        </View>
      </View>
    );
  };

  render() {
    const {
      index,
      title,
      placeholderOne,
      placeholderTwo,
      placeholderThree,
      placeholderFour,
      userType
    } = this.props;
    const { errorMessage, errorMessageVisible, loadscreen } = this.state;
    const validationMessage = "Please fill in the above field";
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
            <View style={{ flex: 1, paddingTop: 100 }}>
              <ProgressDot index={index} userType={userType} />
              <Text
                style={{
                  alignSelf: "center",
                  marginTop: 30,
                  marginBottom: 30,
                  fontSize: index === "5" ? 30 : 60
                }}
              >
                {title}
              </Text>

              <Formik
                initialValues={{
                  name: "",
                  surname: "",
                  email: "",
                  password: "",
                  confirmPassword: ""
                }}
                onSubmit={values => {
                  const { name, surname, email, password } = values;
                  this.registerProfile(index, name, surname, email, password);
                }}
                validationSchema={yup.object().shape({
                  name: yup.string().required(validationMessage),
                  surname: yup.string().required(validationMessage),
                  email: yup.string().required(validationMessage),
                  password: yup.string().required(validationMessage)
                  // confirmPassword: yup
                  //   .string()
                  //   .min(6)
                  //   .required("Password doesn't match")
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
                    {index === "5" ? (
                      this.renderBookScheduleView()
                    ) : index === "4" ? (
                      this.renderCrbView()
                    ) : (
                      <View>
                        <TextInput
                          style={styles.inputStyle}
                          value={values.name}
                          onChangeText={handleChange("name")}
                          onBlur={() => setFieldTouched("name")}
                          placeholder={placeholderOne}
                        />
                        {touched.name && errors.name && (
                          <Text style={styles.textErrorStyle}>
                            {errors.name}
                          </Text>
                        )}
                        <TextInput
                          style={styles.inputStyle}
                          value={values.surname}
                          onChangeText={handleChange("surname")}
                          onBlur={() => setFieldTouched("surname")}
                          placeholder={placeholderTwo}
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
                          placeholder={placeholderThree}
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
                          placeholder={placeholderFour}
                          onBlur={() => setFieldTouched("password")}
                          secureTextEntry={index === "1" ? true : false}
                        />
                        {touched.password && errors.password && (
                          <Text style={styles.textErrorStyle}>
                            {errors.password}
                          </Text>
                        )}
                        {index === "1" ? (
                          <TextInput
                            style={styles.inputStyle}
                            value={values.confirmPassword}
                            onChangeText={handleChange("confirmPassword")}
                            placeholder="Confirm Password"
                            onBlur={() => setFieldTouched("confirmPassword")}
                            secureTextEntry={true}
                          />
                        ) : null}
                        {touched.password && errors.password && (
                          <Text style={styles.textErrorStyle}>
                            {errors.password}
                          </Text>
                        )}
                        {/* {
                      index === '1' && (
                        <CheckBox
                      title='Click if you are a washer'
                      checked={checked}
                      checkedColor='green'
                      uncheckedColor='white'
                      containerStyle={{ backgroundColor: 'transparent', borderColor: 'transparent', marginRight: -20 }}
                      onPress={() => this.setState({checked: !checked})}
                    />
                      )
                    } */}
                      </View>
                    )}
                    {errorMessageVisible && (
                      <ErrorMessage errorMessage={errorMessage} />
                    )}
                    {loadscreen && <ModalLoading text="Please wait" />}
                    <Text
                      style={{
                        alignSelf: "center",
                        paddingTop: 20,
                        paddingBottom: 10
                      }}
                    >
                      {(index === "3" && !userType) || index === "5"
                        ? "Finished"
                        : "Next"}
                    </Text>
                    <Icon
                      containerStyle={[
                        styles.circleBackground,
                        {
                          backgroundColor:
                            (index === "3" && !userType) || index === "5"
                              ? "black"
                              : "white"
                        }
                      ]}
                      name={
                        (index === "3" && !userType) || index === "5"
                          ? "ios-checkmark"
                          : "ios-arrow-forward"
                      }
                      type="ionicon"
                      color={
                        (index === "3" && !userType) || index === "5"
                          ? "white"
                          : "black"
                      }
                      size={25}
                      onPress={
                        index === "5"
                          ? () => this.submitWorkingHours()
                          : index === "4"
                          ? () => this.uploadImages()
                          : handleSubmit
                      }
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
