import React from "react";
import {
  Image,
  Text,
  Dimensions,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { Button, Rating, Icon } from "react-native-elements";
import Modal from "react-native-modal";
import moment from "moment";
import { Avatar } from "react-native-elements";
import { connect } from "react-redux";
import { moderateScale } from "react-native-size-matters";
import ImagePicker from "react-native-image-crop-picker";
import firebase from "react-native-firebase";
import Swiper from "react-native-swiper";
import colors from "../style";
import LoadScreen, { ModalLoading } from "../components/LoadScreen";

var { width, height } = Dimensions.get("window");

const styles = {
  modalStyle: {
    flex: 1,
  },
  touchableStyle: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  inputStyle: {
    alignItems: "center",
    fontSize: 16,
  },
  fieldContainer: {
    flexDirection: "row",
    margin: 10,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderWidth: 1,
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
  },
  button: {
    borderRadius: moderateScale(5),
    backgroundColor: colors.accent,
    width,
    height: 60,
  },
  backgroundWhite: {
    backgroundColor: "white",
    borderWidth: 0,
    borderBottomColor: "transparent",
    display: "flex",
    flexDirection: "row",
    width: "80%",
    borderRadius: 50,
    marginTop: 10,
    marginHorizontal: 35,
    height: 50,
    paddingHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
};

let washArray = [];
let reviewsArray = [];
let sum = 0;
let imagesArray = [];
let imagesName = [];
class Profile extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: "Profile",
      headerStyle: {
        backgroundColor: colors.accent,
        paddingBottom: 20,
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
        color: "white",
        fontSize: 20,
      },
    };
  };

  state = {
    isDateTimePickerVisible: false,
    modalVisible: false,
    isModalVisible: false,
    imageUrl: "",
    stage: true,
    aboutMeValue: "",
    index: 0,
    images: [],
    loading: false,
    loadScreen: true,
    bookedSchedule: [],
    reviews: [],
    washers: [],
    renderModal: false,
  };

  componentDidMount() {
    const { userType } = this.props.user;
    const userId = userType
      ? this.props.user.userId
      : this.props.navigation.state.params.washerDetail.id;
    console.log(userId);
    firebase
      .firestore()
      .collection("images")
      .doc(userId)
      .onSnapshot((imageResponse) => {
        if (imageResponse.data() === undefined) {
          this.setState({ images: imagesArray });
        } else {
          imagesArray = imageResponse.data().images;
          imagesName = imageResponse.data().images;
          this.setState({ images: imagesArray });
          imagesArray = [];
        }
      });
    firebase
      .firestore()
      .collection("reviews")
      .where("washerId", "==", userId)
      .get()
      .then((reviewsResponse) => {
        firebase
          .firestore()
          .collection("bookings")
          .where("washerId", "==", userId)
          //.onSnapshot()
          .get()
          .then(async (querySnapshot) => {
            await querySnapshot.forEach(function (doc) {
              console.log(doc.id, " => ", doc.data());
              const { status } = doc.data();
              if (status === "completed") {
                washArray.push(doc.id);
              }
            });
            await reviewsResponse.forEach(function (reviewDoc) {
              console.log(reviewDoc.id, " => ", reviewDoc.data());
              sum += reviewDoc.data().star;
              console.log(sum);
              reviewsArray.push(reviewDoc.data());
            });
            const average = sum / reviewsArray.length;
            const ratingAverage = reviewsArray.length === 0 ? 0 : average;
            firebase
              .firestore()
              .collection("users")
              .doc(userId)
              .update({ rating: ratingAverage });
            console.log(reviewsArray);
            this.setState({
              reviews: reviewsArray === undefined ? [] : reviewsArray,
              washes: washArray,
              loadScreen: false,
            });
            washArray = [];
            reviewsArray = [];
          })
          .catch((err) => {
            this.setState({ loadScreen: false });
            console.log(err);
          });
      })
      .catch((err) => {
        this.setState({ loadScreen: false });
        console.log(err);
      });
  }

  // renders images inside Swiper
  renderImages = (images) => {
    const { modalVisible } = this.state;
    console.log(images);
    if (images === undefined) {
      return;
    }
    const renderImage = images.map((item, index) => {
      console.log(item, index);
      return (
        <TouchableOpacity
          onPress={() => {
            modalVisible
              ? this.setState({ modalVisible: false })
              : this.setState({ modalVisible: true, imageUrl: item, index });
          }}
          style={modalVisible ? styles.touchableStyle : null}
        >
          <Image
            style={{
              width: modalVisible ? width : width / 3,
              height: modalVisible ? height : 100,
              borderWidth: modalVisible ? 0 : 1,
              borderColor: "white",
            }}
            resizeMode={modalVisible ? "contain" : null}
            source={{
              uri: item,
            }}
          />
        </TouchableOpacity>
      );
    });
    return renderImage;
  };

  // creates modal to hold image Swiper
  showModal = (images) => {
    const { imageUrl, modalVisible, index } = this.state;
    return (
      <Modal
        style={{ flex: 1 }}
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
          {this.renderImages(images)}
        </Swiper>
      </Modal>
    );
  };

  // creates the booking
  createBooking = () => {
    console.log(this.props.navigation.state.params);
    const {
      carType,
      washType,
      dateInMS,
      price,
      washerDetail,
      location,
    } = this.props.navigation.state.params;
    const { userId, fullName } = this.props.user;
    const { id, profilePic } = washerDetail;
    const requestDetails = {
      washerId: id,
      ownerName: fullName,
      washerName: washerDetail.fullName,
      washerProfilePic: profilePic,
      status: "requested",
      started: false,
      ownerId: userId,
      date: dateInMS,
      location: location.formatted_address,
      washType,
      carSize: carType,
      price,
      requestedBooking: true,
      paid: false,
    };
    firebase
      .firestore()
      .collection("bookings")
      .add(requestDetails)
      .then(() => {
        this.setState({ stage: false });
      });
  };

  // updates washer bio in firebase database
  updateAboutMe = () => {
    this.setState({ loading: true });
    const { userId } = this.props.user;
    const { aboutMeValue } = this.state;
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .update({ aboutMe: aboutMeValue })
      .then(() => this.setState({ loading: false }))
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false });
      });
  };

  // creates circular background to hold washes, photos and review count
  renderCircleBackground = (count, title, check) => {
    const { reviews } = this.state;
    return (
      <TouchableOpacity
        onPress={
          check
            ? () => this.props.navigation.navigate("Reviews", { reviews })
            : null
        }
        style={{
          height: moderateScale(100),
          width: moderateScale(100),
          borderRadius: moderateScale(50),
          backgroundColor: colors.accent,
        }}
      >
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: "white",
              textAlign: "center",
              paddingTop: 25,
            }}
          >
            {count}
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "white",
            }}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // updates images url in firebase database
  updateUserImagesArray = () => {
    const { userId } = this.props.user;
    firebase
      .firestore()
      .collection("images")
      .doc(userId)
      .set({ images: imagesName })
      .then(() => {
        this.setState({ loading: false });
        console.log("file successfully uploaded");
        imagesName = [];
      })
      .catch((err) => console.log(err));
  };

  // uploads selected images from gallery to firebase storage
  // and retrieve image url and adds it to image url array
  uploadImage = (selectedImage, index) => {
    const { userId } = this.props.user;
    const { filename, path } = selectedImage[index];
    firebase
      .storage()
      .ref()
      .child(`${userId}/${filename}`)
      .put(path)
      .then((response) => {
        const { downloadURL } = response;
        console.log(downloadURL);
        imagesName.push(downloadURL);
        if (index === selectedImage.length - 1) {
          this.updateUserImagesArray();
          return;
        }
        this.uploadImage(selectedImage, index + 1);
      })
      .catch((err) => console.log(err));
  };

  // opens camera to take picture and store image to firebase storage
  // and retrieves image url and adds it to image url array
  openCamera = async () => {
    const { userId } = this.props.user;
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    }).then((image) => {
      this.setState({ loading: true, renderModal: false });
      console.log("IMAGE", image);
      const newImageName = `${moment().format("DDMMYY_HHmmSSS")}.jpg`;
      firebase
        .storage()
        .ref()
        .child(`${userId}/${newImageName}`)
        .put(image.path)
        .then((response) => {
          const { downloadURL } = response;
          console.log(downloadURL);
          imagesName.push(downloadURL);
          this.updateUserImagesArray();
        })
        .catch((err) => {
          console.log(err);
          this.setState({ renderModal: false, loading: false });
        });
    });
  };

  // sends profile picture image to firebase storage
  // and retrieves image url and updates firebase database
  storeImage = (image) => {
    const { userId } = this.props.user;
    firebase
      .storage()
      .ref()
      .child(`${userId}/profilePic`)
      .put(image)
      .then((response) => {
        const { downloadURL } = response;
        console.log(downloadURL);
        firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .update({ profilePic: downloadURL })
          .then(() => this.setState({ loading: false }))
          .catch((err) => {
            console.log(err);
            this.setState({ loading: false });
          });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loading: false });
      });
  };

  // opens image gallery to choose images and sets path to state
  pickImage = (check) => {
    ImagePicker.openPicker({
      multiple: check,
    })
      .then((selectedImage) => {
        this.setState({ loading: true, renderModal: false });
        if (check) {
          this.uploadImage(selectedImage, 0);
        } else {
          this.storeImage(selectedImage.path);
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({ renderModal: false, loading: false });
      });
  };

  // render modal with option to choose image from gallery or open camera
  renderModal = () => {
    const { renderModal } = this.state;
    return (
      <Modal
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        isVisible={renderModal}
        coverScreen
        hasBackdrop
        backdropColor="black"
        backdropOpacity={0.9}
        onBackdropPress={() => this.setState({ renderModal: false })}
      >
        <Button
          buttonStyle={styles.button}
          fontSize={moderateScale(18)}
          title="Choose photo"
          onPress={() => {
            this.pickImage(true);
          }}
        />
        <Button
          color="#fff"
          buttonStyle={[styles.button, { marginTop: moderateScale(10) }]}
          fontSize={moderateScale(18)}
          title="Open camera"
          onPress={() => {
            this.openCamera();
          }}
        />
      </Modal>
    );
  };

  render() {
    console.log(this.props.user);
    const { userType } = this.props.user;
    console.log(this.props.navigation.state.params.washerDetail);
    const { fullName, aboutMe, rating, profilePic } = userType
      ? this.props.user
      : this.props.navigation.state.params.washerDetail;
    const {
      images,
      loading,
      aboutMeValue,
      reviews,
      washes,
      renderModal,
      loadScreen,
      stage,
      isModalVisible,
    } = this.state;
    if (loadScreen) return <LoadScreen text="Loading profile" />;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              flex: 1,
              position: "relative",
              display: "flex",
            }}
          >
            {this.showModal(images)}
            <View
              style={{
                flexDirection: "row",
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Avatar
                rounded
                source={{
                  uri: profilePic,
                }}
                size="medium"
                avatarStyle={{ flex: 1 }}
                containerStyle={{ marginLeft: 30 }}
                onPress={userType ? () => this.pickImage(false) : null}
              />
              <Text
                style={{
                  flex: 2,
                  alignSelf: "center",
                  fontSize: 17,
                  fontWeight: "600",
                  paddingLeft: 10,
                }}
              >
                {fullName}
              </Text>
              <Button
                buttonStyle={{
                  alignSelf: "center",
                  backgroundColor: "white",
                  borderWidth: 2,
                  flex: 1,
                  borderColor: "black",
                  marginRight: 30,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "black",

                  marginTop: 5,
                }}
                title={userType ? "Upload photos" : "Book me"}
                titleStyle={{ color: "white", fontSize: 13, fontWeight: "600" }}
                onPress={() => {
                  userType
                    ? this.setState({ renderModal: true })
                    : this.setState({ isModalVisible: true });
                }}
              />
            </View>
            <View style={{ marginTop: 30, justifyContent: "space-between" }}>
              <Rating imageSize={25} readonly startingValue={rating} />
            </View>

            {userType && aboutMe === "" ? (
              <View style={styles.fieldContainer}>
                <TextInput
                  style={styles.textInputStyle}
                  value={aboutMeValue}
                  onChangeText={(aboutMeValue) =>
                    this.setState({ aboutMeValue })
                  }
                  placeholder="Say something about yourself"
                  multiline={true}
                />
                <Icon
                  iconStyle={{ alignSelf: "flex-end" }}
                  name="check"
                  type="entypo"
                  color="black"
                  size={18}
                  onPress={() => {
                    this.updateAboutMe();
                  }}
                />
              </View>
            ) : (
              <Text
                style={{
                  paddingHorizontal: 30,
                  paddingVertical: 30,
                  fontSize: 15,
                }}
              >
                {aboutMe}
              </Text>
            )}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                paddingLeft: moderateScale(10, 0.1),
                paddingRight: moderateScale(10, 0.1),
                marginBottom: 10,
                justifyContent: "space-evenly",
              }}
            >
              {this.renderCircleBackground(washes.length, "Washes")}
              {this.renderCircleBackground(images.length, "Photos")}
              {this.renderCircleBackground(reviews.length, "Reviews", true)}
            </View>
            {loading && <ModalLoading text="Please wait" />}
            <View
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 10,
              }}
            >
              {this.renderImages(images)}
            </View>
          </View>
        </ScrollView>
        {renderModal && this.renderModal()}
        <Modal
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          isVisible={isModalVisible}
          coverScreen
          hasBackdrop
          backdropColor="black"
          backdropOpacity={0.9}
          onBackdropPress={() => this.setState({ isModalVisible: false })}
        >
          {stage ? (
            <ScrollView
              contentContainerStyle={{ flex: 1, justifyContent: "center" }}
              showsVerticalScrollIndicator={false}
            >
              <View
                style={{
                  backgroundColor: colors.accent,
                  borderTopLeftRadius: 15,
                  borderTopRightRadius: 15,
                }}
              >
                <View>
                  <Avatar
                    rounded
                    source={{
                      uri: profilePic,
                    }}
                    containerStyle={{
                      borderWidth: 20,
                      borderColor: colors.accent,
                      alignSelf: "center",
                      marginTop: -50,
                      shadowColor: "#000",
                      shadowOffset: {
                        width: 0,
                        height: 7,
                      },
                      shadowOpacity: 0.43,
                      shadowRadius: 9.51,

                      elevation: 15,
                    }}
                    size={100}
                  />
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: "white",
                    marginTop: 10,
                    alignSelf: "center",
                  }}
                >
                  {fullName}
                </Text>
                <View style={styles.backgroundWhite}>
                  <Text>{this.props.navigation.state.params.date}</Text>
                </View>
                <View style={styles.backgroundWhite}>
                  <Text>{this.props.navigation.state.params.where}</Text>
                </View>
                <View style={styles.backgroundWhite}>
                  <Text>{`${this.props.navigation.state.params.washType} Wash`}</Text>
                </View>
                <View style={styles.backgroundWhite}>
                  <Text>{`${this.props.navigation.state.params.carType} Car`}</Text>
                </View>
                <View style={{ backgroundColor: "#FFC733", marginTop: 20 }}>
                  <Text
                    style={{
                      fontSize: 60,
                      fontWeight: "700",
                      color: "white",

                      textAlign: "center",
                      marginVertical: 10,
                    }}
                  >
                    {`£${this.props.navigation.state.params.price}.00`}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: "white",
                    height: 150,
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,
                  }}
                >
                  <Text
                    style={{
                      marginVertical: 30,
                      textAlign: "center",
                      fontSize: 16,
                    }}
                  >
                    Request Booking
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginHorizontal: 70,
                      marginTop: -20,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        height: 70,
                        width: 70,
                        borderRadius: 35,
                        backgroundColor: "black",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        name="x"
                        type="feather"
                        color="white"
                        onPress={() => this.setState({ isModalVisible: false })}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        height: 70,
                        width: 70,
                        borderRadius: 35,
                        backgroundColor: colors.accent,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() => {
                        this.createBooking();
                      }}
                    >
                      <Icon name="check" type="feather" color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => {
                this.setState({ isModalVisible: false });
                this.props.navigation.navigate("Map");
              }}
            >
              <View
                style={{
                  backgroundColor: colors.accent,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "white",
                    textAlign: "center",
                    alignContent: "center",
                    alignSelf: "center",
                    padding: 10,
                  }}
                >
                  Your request has been sent. We will notify you once the
                  booking is confirmed.
                </Text>
              </View>
              <Text
                style={{
                  margin: 20,
                  fontSize: 18,
                  color: "black",
                }}
              >
                Thank You
              </Text>
            </TouchableOpacity>
          )}
        </Modal>
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

export default connect(mapStateToProps)(Profile);
