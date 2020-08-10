import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import moment from "moment";
import firebase from "react-native-firebase";
import LoadScreen from "../components/LoadScreen";
import colors from "../style";

const styles = {
  backgroundWhite: {
    backgroundColor: "white",
    borderBottomColor: "transparent",
    display: "flex",
    flexDirection: "row",
    width: "60%",
    borderRadius: 60,

    alignSelf: "center",
    height: 60,
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
};

export default class WasherBookingDetails extends React.Component {
  static navigationOptions = {
    title: "Bookings",
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
    started: false,
    loadScreen: true,
    booking: {},
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

  // updates booking status in firebase database
  updateBooking = (started) => {
    this.setState({ started: true });
    const { bookingId } = this.props.navigation.state.params.booking;
    firebase
      .firestore()
      .collection("bookings")
      .doc(bookingId)
      .update({
        started: true,
        status: started ? "completed" : "accepted",
      });
  };
  render() {
    const { booking, loadScreen } = this.state;
    const {
      bookingId,
      carSize,
      date,
      ownerName,
      location,
      ownerId,
      price,
      started,
      status,
      washType,
    } = booking;
    console.log(booking);
    const formattedDate = moment(date).format("MMM DD / HH:mm");
    if (loadScreen) return <LoadScreen text="Please wait" />;
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.accent }}
      >
        <View style={{ height: "100%", backgroundColor: colors.accent }}>
          <View
            style={{ alignItems: "center", marginTop: 50, marginBottom: 30 }}
          >
            <Text style={{ fontSize: 24, color: "white", fontWeight: "700" }}>
              {ownerName}
            </Text>
            <Text style={{ fontSize: 22, color: "white", fontWeight: "400" }}>
              {location}
            </Text>
          </View>
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

              backgroundColor: "#FFC733",
              marginTop: 50,
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
          <TouchableOpacity
            style={styles.backgroundWhite}
            onPress={() =>
              this.props.navigation.navigate("Chat", {
                receiverId: ownerId,
                bookingId,
              })
            }
          >
            <Text
              style={{
                textAlign: "center",
                alignSelf: "center",
                color: "black",
              }}
            >
              Contact Client
            </Text>
          </TouchableOpacity>
          {started && status === "completed" && (
            <TouchableOpacity
              style={styles.backgroundWhite}
              onPress={() =>
                this.props.navigation.navigate("FinishJob", {
                  booking,
                  canEdit: false,
                })
              }
            >
              <Text
                style={{
                  textAlign: "center",
                  alignSelf: "center",
                  color: "black",
                }}
              >
                See photos
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              started && status === "accepted"
                ? this.props.navigation.navigate("FinishJob", {
                    booking,
                    canEdit: true,
                  })
                : this.updateBooking(started);
            }}
            style={[
              styles.backgroundWhite,
              { backgroundColor: "black", marginBottom: 10 },
            ]}
          >
            <Text
              style={{
                textAlign: "center",
                alignSelf: "center",
                color: "white",
              }}
            >
              {started && status === "accepted"
                ? "Finish Job"
                : started && status === "completed"
                ? "Job Finished"
                : "Start Job"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}
