import React, { Component } from "react";
import {
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  ImageBackground,
  Image,
  Platform,
} from "react-native";
import { Icon, Text } from "react-native-elements";
import firebase from "react-native-firebase";
import ImagePicker from "react-native-image-crop-picker";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import { connect } from "react-redux";
import ProgressDot from "../components/ProgressDot";
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
  imageStyle: {
    height: 100,
    width: 100,
    marginBottom: 10,
  },
  crbContainer: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  crbTextStyle: {
    fontSize: 20,
    flex: 1.5,
  },
  crbInnerContainer: {
    flex: 1.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

let imagesDownloadUrl = [];
class RegisterCrbCheck extends Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    passportUrl: "",
    lisenceUrl: "",
    insuranceUrl: "",
    niNumber: "",
    errorMessage: "",
    errorMessageVisible: false,
    loadscreen: false,
  };

  // updates the image(passport / license / insurance ) url in firebase database for CRB validation
  updateCrbInFirebase = () => {
    const { userId } = this.props.user;
    const { niNumber } = this.state;
    const crbDetail = {
      passport: imagesDownloadUrl[0],
      lisence: imagesDownloadUrl[1],
      insurance: imagesDownloadUrl[2],
      niNumber,
    };
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .update({
        crbDetail,
        crbChecked: true,
      })
      .then(() => {
        this.setState({ loadscreen: false });
        imagesDownloadUrl = [];
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loadscreen: false });
        imagesDownloadUrl = [];
      });
  };

  // sends all the images array to firebase storage and receives the url of  the image and adds it to imagesDownloadUrl array
  uploadImageToFirebase = (images, index) => {
    const { userId } = this.props.user;
    const path = images[index];
    const filename =
      index === 0 ? "passport" : index === 1 ? "lisence" : "insurance";
    firebase
      .storage()
      .ref()
      .child(`${userId}/${filename}`)
      .put(path)
      .then((response) => {
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
      .catch((err) => console.log(err));
  };

  // checks if all the image path is set and calls uploadImageToFirebase function
  uploadImages = () => {
    let images = [];
    const { passportUrl, lisenceUrl, insuranceUrl, niNumber } = this.state;
    if (passportUrl === "") {
      this.setState({
        errorMessage: "Please upload your passport",
        errorMessageVisible: true,
      });
      return;
    }
    if (lisenceUrl === "") {
      this.setState({
        errorMessage: "Please upload your lisence",
        errorMessageVisible: true,
      });
      return;
    }
    if (insuranceUrl === "") {
      this.setState({
        errorMessage: "Please upload your insurance",
        errorMessageVisible: true,
      });
      return;
    }
    if (niNumber === "") {
      this.setState({
        errorMessage: "Please enter your NI number",
        errorMessageVisible: true,
      });
      return;
    }
    this.setState({
      loadscreen: true,
      errorMessage: "",
      errorMessageVisible: false,
    });
    images = [passportUrl, lisenceUrl, insuranceUrl];
    this.uploadImageToFirebase(images, 0);
  };

  // sets selected images path (passport / license / insurance) to state
  setImageUrl = (index, image) => {
    if (index === 1) {
      this.setState({ passportUrl: image.path });
    } else if (index === 2) {
      this.setState({ lisenceUrl: image.path });
    } else {
      this.setState({ insuranceUrl: image.path });
    }
  };

  // opens camera to take picture to upload and sets image path to state
  openCamera = async (index) => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    }).then((image) => {
      const newImageName = `${moment().format("DDMMYY_HHmmSSS")}.jpg`;
      this.setImageUrl(index, image);
    });
  };

  // opens image gallery to select images to upload and sets image path to state
  pickImage = (index) => {
    ImagePicker.openPicker({
      multiple: false,
    }).then((image) => {
      this.setImageUrl(index, image);
    });
  };

  // creates view for each document input
  renderColumn = (title, index, url) => {
    return (
      <View style={styles.crbContainer}>
        <Text style={styles.crbTextStyle}>{title}</Text>
        <View style={styles.crbInnerContainer}>
          <Icon
            name="upload"
            type="feather"
            size={30}
            onPress={() => this.pickImage(index)}
          />
          <Icon
            name="camera"
            type="feather"
            size={30}
            onPress={() => this.openCamera(index)}
          />
          <Image
            resizeMode="contain"
            style={styles.imageStyle}
            source={{ uri: url }}
          />
        </View>
      </View>
    );
  };

  // creates view to hold all the column for documents input
  renderCrbView = () => {
    const { passportUrl, lisenceUrl, insuranceUrl, niNumber } = this.state;
    console.log(passportUrl, lisenceUrl, insuranceUrl);
    return (
      <View style={{ flex: 1, backgroundColor: "white", padding: 20 }}>
        {this.renderColumn("Passport", 1, passportUrl)}
        {this.renderColumn("Driving Liscence", 2, lisenceUrl)}
        {this.renderColumn("Liability Insurance", 3, insuranceUrl)}
        <TextInput
          style={styles.inputStyle}
          placeholder="NI Number"
          onChangeText={(text) => this.setState({ niNumber: text })}
          value={niNumber}
        />
      </View>
    );
  };

  render() {
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
            <View style={{ flex: 1, paddingTop: 100 }}>
              <ProgressDot index={3} userType={true} />
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
              {this.renderCrbView()}
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
                onPress={() => this.uploadImages()}
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

export default connect(mapStateToProps)(RegisterCrbCheck);
