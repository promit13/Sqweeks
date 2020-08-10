import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import moment from "moment";
import firebase from "firebase";
import colors from "../style";

// renders each booking item on the washer booking list.
const WasherBookingSingle = ({ status, onPress, booking, bookedSchedule }) => {
  const { ownerName, washType, date, washerId, location, price } = booking;
  console.log(date);
  const formattedDate = moment(date).format("DD MMM hh:mm A");
  const dateArray = formattedDate.split(" ");
  console.log(dateArray[3]);

  // either accepts or rejects the booking request
  respondToBooking = (message, book, check) => {
    const { bookingId, date } = book;
    const bookedHours = [date - 3600000, date + 3600000];
    firebase
      .firestore()
      .collection("bookings")
      .doc(bookingId)
      .update({ status: message, bookedHours })
      .then(() => {
        console.log("Updated");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // navigates to booking detail
  navigateToViewBooking = (book) => {
    this.props.navigation.navigate("ViewBooking", {
      booking: book,
    });
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: status ? "white" : "#707070",
        marginHorizontal: 25,
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 5,
        },
        justifyContent: "center",
        shadowOpacity: 0.34,
        shadowRadius: 6.27,
        paddingBottom: status ? 20 : 0,
        elevation: 10,
      }}
      onPress={status ? onPress : null}
    >
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            height: 70,
            width: 70,
            borderRadius: 35,
            backgroundColor: status ? colors.accent : "black",
            justifyContent: "center",
            marginLeft: 30,
            marginTop: 20,
            flexDirection: "column",
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 26,
              color: status ? "black" : "white",
              fontWeight: "700",
            }}
          >
            {dateArray[0]}
          </Text>
          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              color: status ? "black" : "white",
              fontWeight: "500",
            }}
          >
            {dateArray[1]}
          </Text>
        </View>
        <View style={{ marginLeft: 30, marginTop: 20 }}>
          <Text style={{ fontWeight: "700", fontSize: 16 }}>{ownerName}</Text>
          <Text style={{ fontSize: 15, marginRight: 100 }}>{location}</Text>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginHorizontal: 30,
          marginTop: 20,
        }}
      >
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: status ? "black" : "white",
            }}
          >
            {dateArray[2]}
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: status ? "black" : "white",
              fontSize: 14,
              fontWeight: "400",
            }}
          >
            {dateArray[3]}
          </Text>
        </View>
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: status ? "black" : "white",
            }}
          >
            {washType}
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: status ? "black" : "white",
              fontSize: 14,
              fontWeight: "400",
            }}
          >
            Wash
          </Text>
        </View>
        <View style={{ flexDirection: "column" }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: status ? "black" : "white",
            }}
          >
            {`£${price}`}
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: status ? "black" : "white",
              fontSize: 14,
              fontWeight: "400",
            }}
          >
            Inc Vat
          </Text>
        </View>
      </View>
      {status ? null : (
        <View style={{ flexDirection: "row", display: "flex" }}>
          <TouchableOpacity
            style={{
              flex: 1,
              height: 60,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "red",
              marginTop: 25,
            }}
            onPress={() => {
              this.respondToBooking("rejected", booking);
            }}
          >
            <Text style={{ color: "white" }}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              height: 60,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "green",
              marginTop: 25,
            }}
            onPress={() => this.respondToBooking("accepted", booking, true)}
          >
            <Text style={{ color: "white" }}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default WasherBookingSingle;
