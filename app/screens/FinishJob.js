import React from "react";
import {
  Image,
  Dimensions,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { Button } from "react-native-elements";
import Modal from "react-native-modal";
import { connect } from "react-redux";
import { moderateScale } from "react-native-size-matters";
import ImagePicker from "react-native-image-crop-picker";
import firebase from "react-native-firebase";
import Swiper from "react-native-swiper";
import colors from "../style";
import { ModalLoading } from "../components/LoadScreen";
import ErrorMessage from "../components/Error";

var { width } = Dimensions.get("window");

const styles = {
  modalStyle: {
    flex: 1,
  },
  touchableStyle: {
    flex: 1,
    width,
    justifyContent: "center",
    alignItems: "center",
  },
  inputStyle: {
    height: 100,
    backgroundColor: "white",
    width: width - 40,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignSelf: "center",
    borderRadius: 10,
    marginTop: 20,
    fontSize: 16,
  },
  button: {
    borderRadius: moderateScale(5),
    backgroundColor: "black",
    width: width - 40,
    alignSelf: "center",
    marginTop: 20,
    height: 60,
  },
};

let imagesUrls = [];
class FinishJob extends React.Component {
  static navigationOptions = {
    title: "Job",
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
    note: "",
    images: [],
    loading: false,
    showError: false,
    errorMessage: "",
  };

  componentDidMount() {
    const { booking, canEdit } = this.props.navigation.state.params;
    console.log(booking);
    if (!canEdit) {
      const { note, carImages } = booking;
      this.setState({ note, images: carImages });
    }
  }

  // updates booking status in firebase database and adds image urls
  updateBooking = () => {
    const { bookingId } = this.props.navigation.state.params.booking;
    const { note } = this.state;
    firebase
      .firestore()
      .collection("bookings")
      .doc(bookingId)
      .update({
        status: "completed",
        note,
        carImages: imagesUrls,
      })
      .then(() => {
        imagesUrls = [];
        this.setState({ loading: false, showError: false, errorMessage: "" });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          loading: false,
          showError: true,
          errorMessage: "Something went wrong. Please try again.",
        });
      });
  };

  // render images inside a swiper
  renderImages = () => {
    const { modalVisible, images } = this.state;
    console.log(images);
    if (images === undefined) {
      return;
    }
    const renderImage = images.map((item, index) => {
      console.log(item, index);
      const { path } = item;
      return (
        <TouchableOpacity
          onPress={() => {
            modalVisible
              ? this.setState({ modalVisible: false })
              : this.setState({ modalVisible: true, imageUrl: path, index });
          }}
          style={modalVisible ? styles.touchableStyle : null}
        >
          <Image
            style={{
              width: modalVisible ? width : width / 3,
              height: modalVisible ? 500 : 100,
              borderWidth: modalVisible ? 0 : 1,
              borderColor: "white",
            }}
            resizeMode={modalVisible ? "contain" : null}
            source={{
              uri: path,
            }}
          />
        </TouchableOpacity>
      );
    });
    return renderImage;
  };

  // renders swiper inside a modal
  showModal = () => {
    const { modalVisible, index } = this.state;
    return (
      <Modal
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        isVisible={modalVisible}
        coverScreen
        hasBackdrop
        backdropColor="black"
        backdropOpacity={1}
        onBackdropPress={() => this.setState({ modalVisible: false })}
      >
        <Swiper
          loop={false}
          showsButtons // shows side arrows
          showsPagination={false}
          index={index}
        >
          {this.renderImages()}
        </Swiper>
      </Modal>
    );
  };

  // opens image gallery to select images to upload
  pickImage = () => {
    ImagePicker.openPicker({
      multiple: true,
    })
      .then((selectedImages) => {
        this.setState({ images: selectedImages });
        console.log(selectedImages);
      })
      .catch((err) => {
        console.log(err);
        this.setState({ renderModal: false, loading: false });
      });
  };

  // uploads selected images to firebase storage and retrieves image url
  uploadImage = (index) => {
    const { userId } = this.props.user;
    const { bookingId, washerId } = this.props.navigation.state.params.booking;
    console.log(userId, washerId);
    const { images } = this.state;
    const { filename, sourceURL, path } = images[index];
    firebase
      .storage()
      .ref()
      .child(`${bookingId}/${filename}`)
      .put(path)
      .then((response) => {
        const { downloadURL } = response;
        console.log(downloadURL);
        imagesUrls.push({ path: downloadURL });
        if (index === images.length - 1) {
          this.updateBooking();
          return;
        }
        this.uploadImage(index + 1);
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          loading: false,
          showError: true,
          errorMessage: "Something went wrong. Please try again.",
        });
      });
  };

  render() {
    const { note, images, showError, errorMessage, loading } = this.state;
    const { canEdit } = this.props.navigation.state.params;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.accent }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TextInput
            style={styles.inputStyle}
            multiline
            placeholder="Write some notes to owner..."
            value={note}
            onChangeText={(note) => this.setState({ note })}
            editable={canEdit}
          />
          <View
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            {this.renderImages()}
          </View>
          {this.showModal(images)}
          {loading && <ModalLoading text="Please wait" />}
          {showError && <ErrorMessage errorMessage={errorMessage} />}
          {canEdit && (
            <View>
              <Button
                buttonStyle={styles.button}
                fontSize={moderateScale(18)}
                title="Choose photo"
                onPress={() => {
                  this.pickImage();
                }}
              />
              <Button
                buttonStyle={styles.button}
                fontSize={moderateScale(18)}
                title="Submit"
                onPress={() => {
                  if (note === "" || images.length === 0) {
                    Alert.alert(
                      "Please write some notes and add at least one photo."
                    );
                    return;
                  }
                  this.setState({ loading: true });
                  this.uploadImage(0);
                }}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
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

export default connect(mapStateToProps)(FinishJob);
