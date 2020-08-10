import React from "react";
import { Text, View, ScrollView } from "react-native";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import WasherBookingSingle from "../components/WasherBookingSingle";
import colors from "../style";
import LoadScreen from "../components/LoadScreen";

class WasherBookingsList extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    requestedBookingArray: [],
    upcomingBookingArray: [],
    completedBookingArray: [],
    bookedSchedule: [],
    loading: true,
  };

  componentDidMount() {
    let requestedBookingArray = [];
    let upcomingBookingArray = [];
    let completedBookingArray = [];
    const { userId, userType } = this.props.user;
    firebase
      .firestore()
      .collection("bookings")
      .where("washerId", "==", userId)
      .onSnapshot(async (querySnapshot) => {
        await querySnapshot.forEach(function (doc) {
          console.log(doc.id, " => ", doc.data());
          const { status, requestedBooking } = doc.data();
          if (status === "requested") {
            requestedBookingArray.push({
              ...doc.data(),
              bookingId: doc.id,
              userType,
            });
          } else if (status === "accepted" && requestedBooking) {
            upcomingBookingArray.push({
              ...doc.data(),
              bookingId: doc.id,
              userType,
            });
          } else if (status === "completed") {
            completedBookingArray.push({
              ...doc.data(),
              bookingId: doc.id,
              userType,
            });
          }
        });
        const sortedRequested = requestedBookingArray.sort(
          (a, b) => b.date - a.date
        );
        const sortedAccepted = upcomingBookingArray.sort(
          (a, b) => b.date - a.date
        );
        const sortedCompleted = completedBookingArray.sort(
          (a, b) => b.date - a.date
        );
        this.setState({
          requestedBookingArray: sortedRequested,
          upcomingBookingArray: sortedAccepted,
          completedBookingArray: sortedCompleted,
          loading: false,
        });
        requestedBookingArray = [];
        upcomingBookingArray = [];
        completedBookingArray = [];
      });
  }

  // renders all the booking
  renderBookings = (bookingDetail, status) => {
    const bookings = bookingDetail.map((booking, index) => {
      console.log(booking);
      return (
        <WasherBookingSingle
          booking={booking}
          status={status}
          onPress={() =>
            this.props.navigation.navigate("WasherBookingDetails", {
              booking,
            })
          }
        />
      );
    });
    return bookings;
  };

  // renders title for booking (Booking Requests / Upcoming Bookings/ Completed Bookings)
  renderHeading = (heading, length) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          marginHorizontal: 25,
          marginTop: 20,
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "700" }}>{heading}</Text>
        <View
          style={{
            height: 50,
            width: 50,
            borderRadius: 25,
            marginTop: -10,
            backgroundColor: "black",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "700",
              fontSize: 18,
            }}
          >
            {length}
          </Text>
        </View>
      </View>
    );
  };

  render() {
    const {
      requestedBookingArray,
      upcomingBookingArray,
      completedBookingArray,
      loading,
    } = this.state;
    console.log(requestedBookingArray);
    if (loading) return <LoadScreen text="Loading bookings" />;
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.accent, flex: 1 }}
      >
        <View style={{ backgroundColor: "white", paddingBottom: 20 }}>
          {this.renderHeading("Booking Requests", requestedBookingArray.length)}
          {this.renderBookings(requestedBookingArray)}
        </View>
        {this.renderHeading("Upcoming Bookings", upcomingBookingArray.length)}
        {this.renderBookings(upcomingBookingArray, true)}
        {this.renderHeading("Completed Bookings", completedBookingArray.length)}
        {this.renderBookings(completedBookingArray, true)}
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

export default connect(mapStateToProps)(WasherBookingsList);
