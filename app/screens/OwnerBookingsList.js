import React from "react";
import { View, ScrollView, Text } from "react-native";
import { connect } from "react-redux";
import firebase from "firebase";
import colors from "../style";
import OwnerBookingSingle from "../components/OwnerBookingSingle";
import LoadScreen from "../components/LoadScreen";

let upcomingBookingArray = [];
let completedBookingArray = [];
class OwnerBookingsList extends React.Component {
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
    bookginArray: [],
    loading: true,
    upcomingBookingArray: [],
    completedBookingArray: [],
  };

  componentDidMount() {
    const { userId, userType } = this.props.user;
    console.log(userId);
    firebase
      .firestore()
      .collection("bookings")
      .where("ownerId", "==", userId)
      //.onSnapshot()
      .onSnapshot(async (querySnapshot) => {
        await querySnapshot.forEach(function (doc) {
          // doc.data() is never undefined for query doc snapshots
          console.log(doc.id, " => ", doc.data());
          // bookingArray.push({...doc.data(), bookingId: doc.id});
          const { status, requestedBooking } = doc.data();
          if (
            (status === "accepted" && requestedBooking) ||
            status === "requested"
          ) {
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
        const sortedAccepted = upcomingBookingArray.sort(
          (a, b) => b.date - a.date
        );
        const sortedCompleted = completedBookingArray.sort(
          (a, b) => b.date - a.date
        );
        this.setState({
          upcomingBookingArray: sortedAccepted,
          completedBookingArray: sortedCompleted,
          loading: false,
        });
        upcomingBookingArray = [];
        completedBookingArray = [];
      });
  }

  // renders all the upcoming and completed bookings
  renderBookings = (bookingDetail) => {
    const bookings = bookingDetail.map((booking) => {
      console.log(booking);
      return (
        <OwnerBookingSingle
          booking={booking}
          onPress={() =>
            this.props.navigation.navigate("OwnerBookingDetails", {
              booking: booking,
            })
          }
        />
      );
    });
    return bookings;
  };

  // renders title for booking (Upcoming Bookings/ Completed Bookings)
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
    const { upcomingBookingArray, completedBookingArray, loading } = this.state;
    if (loading) return <LoadScreen text="Loading bookings" />;
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
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

export default connect(mapStateToProps)(OwnerBookingsList);
