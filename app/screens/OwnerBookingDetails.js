import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { Avatar, Button } from "react-native-elements";
import firebase from "react-native-firebase";
import axios from "axios";
import Modal from "react-native-modal";
import moment from "moment";
import { connect } from "react-redux";
import colors from "../style";
import { moderateScale } from "react-native-size-matters";
import { StripePaymentUrl } from "../config";
import LoadScreen, { ModalLoading } from "../components/LoadScreen";
import ShowModal from "../components/ShowModal";

const { width } = Dimensions.get("window");

const styles = {
  backgroundWhite: {
    backgroundColor: "white",
    borderBottomColor: "transparent",
    display: "flex",
    flexDirection: "row",
    width: "60%",
    borderRadius: 50,
    alignSelf: "center",
    height: 50,
    border: 0,
    paddingHorizontal: 15,
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    borderRadius: moderateScale(5),
    backgroundColor: colors.accent,
  },
};
class OwnerBookingDetails extends React.Component {
  static navigationOptions = {
    title: "Booking",
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
    washerDetail: {},
    booking: {},
    paid: false,
    loading: false,
    loadScreen: true,
    renderCancelModal: false,
    showModal: false,
    modalText: "",
    showCardModal: false,
  };

  componentDidMount() {
    const { bookingId } = this.props.navigation.state.params.booking;
    firebase
      .firestore()
      .collection("bookings")
      .doc(bookingId)
      .onSnapshot((response) => {
        console.log(response.data());
        this.setState({
          loadScreen: false,
          booking: { ...response.data(), bookingId: response.id },
        });
      });
  }

  //  updates firebase database when the user pays for the car wash
  updatePaidFirebase = () => {
    const { bookingId } = this.props.navigation.state.params.booking;
    firebase
      .firestore()
      .collection("bookings")
      .doc(bookingId)
      .update({ paid: true })
      .then(() => {
        this.setState({
          paid: true,
          loading: false,
          showModal: true,
          modalText: "Payment successful",
        });
      })
      .catch((err) => console.log(err));
  };

  // updates firebase database if the user wants to cancel the booking
  deleteBooking = () => {
    const { bookingId } = this.props.navigation.state.params.booking;
    firebase
      .firestore()
      .collection("bookings")
      .doc(bookingId)
      .delete()
      .then(() => {
        this.setState({
          paid: true,
          loading: false,
          showModal: true,
          modalText: "Booking cancelled",
        });
        this.props.navigation.navigate("OwnerBookingsList");
      })
      .catch((err) => console.log(err));
  };

  // makes payment for the car wash done.
  // Also makes payment of  50% of the total fee, if the user wants to cancel booking
  // after the washer accepts and the cancellation date is within 2 days of the booking date.
  pay = (check) => {
    const {
      bookingId,
      price,
      washerId,
    } = this.props.navigation.state.params.booking;
    const { location, email, fullName, customerId, userId } = this.props.user;
    const { city, postcode, street, houseName } = location;

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
    const priceToPay = check ? (price * 100) / 2 : price * 100;
    axios
      .post(StripePaymentUrl, {
        amount: priceToPay,
        currency: "GBP",
        customerId,
        description: check ? "Cancellation fee" : "Wash fee",
        bookingId,
        billing_details,
        userId,
        email,
        washerId,
      })
      .then((response) => {
        console.log(response);
        check ? this.deleteBooking() : this.updatePaidFirebase();
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          loading: false,
          showModal: true,
          modalText: "Error making payment. Check your card detail.",
        });
      });
  };

  // shows modal with the buttons and messages provided when user wants to cancel the booking
  renderCancelWarning = () => {
    const { renderCancelModal } = this.state;
    const { date, status } = this.props.navigation.state.params.booking;
    const { cardLastFourDigit } = this.props.user;
    const todayDate = new Date().getTime();
    const hasToPay =
      date - todayDate < 172800000 && status === "accepted" ? true : false;
    console.log(hasToPay);
    return (
      <Modal
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        isVisible={renderCancelModal}
        coverScreen
        hasBackdrop
        backdropColor="black"
        onBackdropPress={() => this.setState({ renderCancelModal: false })}
      >
        <View style={{ backgroundColor: "white", width, padding: 40 }}>
          <Text style={styles.modalText}>
            {hasToPay
              ? `You will be charged 50% of the total fee from the card \n**** **** **** ${cardLastFourDigit}.\nIf you wish to pay with different card, go to settings and change the card detail.`
              : "You won't be charged any amount."}
          </Text>
          <Button
            buttonStyle={styles.button}
            fontSize={moderateScale(18)}
            title="Confirm"
            onPress={() => {
              this.setState({ renderCancelModal: false, loading: true });
              hasToPay ? this.pay(true) : this.deleteBooking();
            }}
          />
          <Button
            color="#fff"
            buttonStyle={[styles.button, { marginTop: moderateScale(10) }]}
            fontSize={moderateScale(18)}
            title="Cancel"
            onPress={() => {
              this.setState({ renderCancelModal: false });
            }}
          />
        </View>
      </Modal>
    );
  };

  // shows modal with button and messages provided when user wants to make payment
  renderCardModal = () => {
    const { showCardModal } = this.state;
    const { price } = this.props.navigation.state.params.booking;
    const { cardLastFourDigit } = this.props.user;
    return (
      <Modal
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        isVisible={showCardModal}
        coverScreen
        hasBackdrop
        backdropColor="black"
        onBackdropPress={() => this.setState({ showCardModal: false })}
      >
        <View style={{ backgroundColor: "white", width, padding: 40 }}>
          <Text
            style={styles.modalText}
          >{`You are about to pay £${price} for the car wash fee with the card \n**** **** **** ${cardLastFourDigit}.\nIf you wish to pay with different card, go to settings and change the card detail.`}</Text>
          <Button
            buttonStyle={styles.button}
            fontSize={moderateScale(18)}
            title="Continue with this card"
            onPress={() => {
              this.setState({ showCardModal: false, loading: true });
              this.pay(false);
            }}
          />
          <Button
            color="#fff"
            buttonStyle={[styles.button, { marginTop: moderateScale(10) }]}
            fontSize={moderateScale(18)}
            title="Cancel"
            onPress={() => {
              this.setState({ showCardModal: false });
            }}
          />
        </View>
      </Modal>
    );
  };

  render() {
    const { loading, booking, loadScreen, showModal, modalText } = this.state;
    const {
      bookingId,
      carSize,
      date,
      location,
      price,
      paid,
      status,
      washType,
      washerId,
      washerProfilePic,
      washerName,
    } = booking;
    const formattedDate = moment(date).format("MMM DD / HH:mm");
    if (loadScreen) return <LoadScreen text="Please wait" />;
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.accent }}
      >
        <View>
          <View style={{ height: "100%", backgroundColor: colors.accent }}>
            <View style={{ alignSelf: "center", marginVertical: 60 }}>
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
                  uri: washerProfilePic,
                }}
              />
            </View>
            <View>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 24,
                  marginTop: -30,
                  color: "white",
                  fontWeight: "700",
                }}
              >
                {washerName}
              </Text>
            </View>
            <View>
              <View style={styles.backgroundWhite}>
                <Text style={{ textAlign: "center", alignSelf: "center" }}>
                  {location}
                </Text>
              </View>
              <View style={styles.backgroundWhite}>
                <Text style={{ textAlign: "center", alignSelf: "center" }}>
                  {formattedDate}
                </Text>
              </View>
              <View style={styles.backgroundWhite}>
                <Text style={{ textAlign: "center", alignSelf: "center" }}>
                  {`${washType} / ${carSize}`}
                </Text>
              </View>
              <View
                style={{
                  paddingVertical: 10,
                  marginTop: 10,
                  backgroundColor: "#FFC733",
                }}
              >
                <Text
                  style={{
                    fontSize: 50,
                    fontWeight: "700",
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  {`£${price}.00`}
                </Text>
              </View>
              {loading && <ModalLoading text="Please wait" />}
              {showModal && (
                <ShowModal
                  showModal={showModal}
                  onPress={() => this.setState({ showModal: false })}
                  modalText={modalText}
                />
              )}
              {this.renderCancelWarning()}
              {this.renderCardModal()}
              <TouchableOpacity
                style={styles.backgroundWhite}
                onPress={() =>
                  this.props.navigation.navigate("Chat", {
                    receiverId: washerId,
                    bookingId,
                  })
                }
              >
                <Text style={{ textAlign: "center", alignSelf: "center" }}>
                  Contact Washer
                </Text>
              </TouchableOpacity>
              {status === "completed" ? (
                <View>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate("FinishJob", {
                        booking: this.props.navigation.state.params.booking,
                        canEdit: false,
                      })
                    }
                    style={styles.backgroundWhite}
                  >
                    <Text style={{ textAlign: "center", alignSelf: "center" }}>
                      See Photos
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate("TipAndRate", {
                        booking: this.props.navigation.state.params.booking,
                        washerProfilePic,
                      })
                    }
                    style={styles.backgroundWhite}
                  >
                    <Text style={{ textAlign: "center", alignSelf: "center" }}>
                      Tip and Rate
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.backgroundWhite,
                      { backgroundColor: "black", marginBottom: 20 },
                    ]}
                    onPress={() =>
                      paid
                        ? Alert.alert("Payment has already been done")
                        : this.setState({ showCardModal: true })
                    }
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        alignSelf: "center",
                        color: "white",
                      }}
                    >
                      {paid ? "Paid" : "Pay"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.backgroundWhite, { marginBottom: 10 }]}
                  onPress={() => this.setState({ renderCancelModal: true })}
                >
                  <Text style={{ textAlign: "center", alignSelf: "center" }}>
                    Cancel Booking
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
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

export default connect(mapStateToProps)(OwnerBookingDetails);
