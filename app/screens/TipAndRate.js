import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Avatar, Input, Icon } from "react-native-elements";
import firebase from "react-native-firebase";
import colors from "../style";
import { connect } from "react-redux";
import axios from "axios";
import { AirbnbRating } from "react-native-ratings";
import ModalSelector from "react-native-modal-selector";
import moment from "moment";
import { StripePaymentUrl } from "../config";
import { ModalLoading } from "../components/LoadScreen";
import ShowModal from "../components/ShowModal";

const data = [
  { key: 0, section: true, label: "Tips" },
  { key: 0.5, label: "£0.50" },
  { key: 1.0, label: "£1.00" },
  { key: 1.5, label: "£1.50" },
  { key: 2.0, label: "£2.00" },
  { key: 2.5, label: "£2.50" },
  { key: 3.0, label: "£3.00" },
  { key: 3.5, label: "£3.50" },
  { key: 4.0, label: "£4.00" },
  { key: 4.5, label: "£4.50" },
  { key: 5.0, label: "£5.00" },
];

const ratingHeading = ["Terrible", "Bad", "Good", "Very Good", "Amazing"];
class TipAndRate extends React.Component {
  static navigationOptions = {
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
    review: "",
    star: 5,
    ratingHeader: "Amazing",
    tip: { key: 0, label: "£0.0" },
    loading: false,
    showModal: false,
    modalText: "",
  };

  // adds review on firebase database
  saveReview = () => {
    const { ownerName, washerId } = this.props.navigation.state.params.booking;
    const { review, star } = this.state;
    const comment = review === "" ? "This user left no review" : review;
    const todayDate = new Date();
    const createdAt = moment(todayDate).format("MMM DD, YYYY");
    const reviewDetail = {
      customerName: ownerName,
      createdAt,
      review: comment,
      star,
      reviewHeader: ratingHeading[star - 1],
      washerId,
    };
    console.log(reviewDetail);
    firebase
      .firestore()
      .collection("reviews")
      .add(reviewDetail)
      .then(() => {
        this.setState({
          loading: false,
          modalText: "Review added",
          showModal: true,
        });
      })
      .catch((err) => console.log(err));
  };

  // makes tip payment
  pay = () => {
    const { bookingId, washerId } = this.props.navigation.state.params.booking;
    const { location, email, fullName, customerId, userId } = this.props.user;
    const { city, postcode, street, houseName } = location;
    const priceToPay = this.state.tip.key * 100;
    console.log(priceToPay);
    const billing_details = {
      address: {
        city,
        postal_code: postcode,
        country: "UK",
        line1: `${houseName} ${street}`,
        line2: "",
        state: "",
      },
      email,
      name: fullName,
      phone: null,
    };
    console.log(billing_details);
    console.log(email, userId);
    axios
      .post(StripePaymentUrl, {
        amount: priceToPay,
        currency: "GBP",
        customerId,
        description: "Tip",
        bookingId,
        billing_details,
        userId,
        email,
        washerId,
      })
      .then((response) => {
        this.saveReview();
      })
      .catch((err) => console.log(err));
  };

  render() {
    const { booking, profilePic } = this.props.navigation.state.params;
    const { washerName } = booking;
    const { review, tip, loading, showModal, modalText } = this.state;
    console.log(tip);
    const platform = Platform.OS;
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={platform === "android" ? "" : "padding"}
        enabled
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.accent }}
        >
          <View style={{ height: "100%", backgroundColor: colors.accent }}>
            {loading && <ModalLoading text="Please wait" />}
            {showModal && (
              <ShowModal
                showModal={showModal}
                onPress={() => this.setState({ showModal: false })}
                modalText={modalText}
              />
            )}
            <View style={{ alignSelf: "center", marginVertical: 30 }}>
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{ fontSize: 40, fontWeight: "700", color: "white" }}
                >
                  Tip and Rate
                </Text>
              </View>
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                  alignSelf: "center",
                }}
              >
                <Avatar
                  rounded
                  size={120}
                  containerStyle={{
                    borderWidth: 25,
                    borderColor: colors.accent,
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 5,
                    },
                    shadowOpacity: 0.34,
                    shadowRadius: 6.27,

                    elevation: 10,
                  }}
                  source={{
                    uri: profilePic,
                  }}
                />
              </View>
            </View>
            <View>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 30,
                  marginTop: -10,
                  color: "white",
                  fontWeight: "700",
                }}
              >
                {washerName}
              </Text>

              <View>
                <AirbnbRating
                  count={5}
                  reviews={ratingHeading}
                  defaultRating={5}
                  size={50}
                  reviewColor="white"
                  onFinishRating={(count) => this.setState({ star: count })}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    alignSelf: "center",
                    marginTop: 30,
                    color: "white",
                  }}
                >
                  Give your washer a review!
                </Text>
              </View>
              <View>
                <Input
                  multiline={true}
                  containerStyle={{
                    height: 150,
                    backgroundColor: "white",
                    width: "85%",
                    alignContent: "center",
                    paddingHorizontal: 30,
                    paddingVertical: 20,
                    alignSelf: "center",
                    borderRadius: 10,
                    marginTop: 20,
                  }}
                  inputContainerStyle={{
                    borderColor: "transparent",
                  }}
                  placeholder="Please leave some reivew..."
                  onChangeText={(review) => this.setState({ review })}
                  value={review}
                />
              </View>
              <View>
                <TouchableOpacity
                  style={{
                    backgroundColor: "white",
                    borderBottomColor: "transparent",
                    display: "flex",
                    flexDirection: "row",
                    width: "80%",
                    borderRadius: 50,
                    marginTop: 20,
                    marginHorizontal: 35,
                    alignContent: "center",
                    alignSelf: "center",
                    alignItems: "center",
                    height: 45,
                    border: 0,
                    paddingHorizontal: 15,
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 5,
                    },
                    shadowOpacity: 0.34,
                    shadowRadius: 6.27,

                    elevation: 10,
                  }}
                >
                  <ModalSelector
                    data={data}
                    selectStyle={{ borderColor: "white" }}
                    optionContainerStyle={{ backgroundColor: "white" }}
                    optionTextStyle={{
                      color: "black",
                    }}
                    selectTextStyle={{
                      color: "black",
                      textAlign: "center",
                      alignSelf: "center",
                      fontSize: 18,
                    }}
                    style={{ flex: 4, marginLeft: 45 }}
                    initValue={tip.label}
                    onChange={(value) => {
                      this.setState({ tip: value });
                    }}
                  />
                  <Icon
                    name="angle-down"
                    type="font-awesome"
                    color="black"
                    containerStyle={{ flex: 1, justifyContent: "center" }}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{
                  height: 70,
                  width: 70,
                  borderRadius: 35,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  alignSelf: "center",
                  marginVertical: 20,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 7,
                  },
                  shadowOpacity: 0.43,
                  shadowRadius: 9.51,
                  elevation: 15,
                }}
                onPress={() => {
                  this.setState({ loading: true });
                  if (tip.key === 0) {
                    this.saveReview();
                    return;
                  }
                  this.pay();
                }}
              >
                <Icon name="check" type="feather" color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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

export default connect(mapStateToProps)(TipAndRate);
