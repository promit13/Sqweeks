import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Avatar } from "react-native-elements";
import moment from "moment";
import colors from "../style";

// renders each booking item on the owner booking list
const OwnerBookingSingle = ({ booking, onPress }) => {
  const { date, washType, washerName, washerProfilePic } = booking;
  const formattedDate = moment(date).format("DD MMM hh:mm A");
  const dateArray = formattedDate.split(" ");
  console.log(dateArray[3]);
  console.log(washerProfilePic);
  return (
    <View>
      <View
        style={{
          height: 170,
          backgroundColor: colors.accent,
          marginTop: 10,
          marginHorizontal: 10,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.29,
          shadowRadius: 4.65,

          elevation: 7,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 20,
            marginHorizontal: 20,
          }}
        >
          <Avatar
            rounded
            size="medium"
            source={{
              uri: washerProfilePic,
            }}
          />
          <Text style={{ fontSize: 16, marginTop: 15 }}>{washerName}</Text>
          <TouchableOpacity
            style={{
              height: 40,
              width: 120,
              borderRadius: 20,
              backgroundColor: "black",
              justifyContent: "center",
              marginTop: 5,
            }}
            onPress={onPress}
          >
            <Text
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              View Booking
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginHorizontal: 30,
            marginVertical: 20,
          }}
        >
          <View style={{ flexDirection: "column" }}>
            <Text style={{ fontSize: 28, color: "white", fontWeight: "700" }}>
              {dateArray[2]}
            </Text>
            <Text
              style={{
                fontSize: 20,
                color: "white",
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {dateArray[3]}
            </Text>
          </View>
          <View style={{ flexDirection: "column" }}>
            <Text style={{ fontSize: 28, color: "white", fontWeight: "700" }}>
              {dateArray[0]}
            </Text>
            <Text
              style={{
                fontSize: 20,
                color: "white",
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {dateArray[1]}
            </Text>
          </View>
          <View style={{ flexDirection: "column" }}>
            <Text style={{ fontSize: 28, color: "white", fontWeight: "700" }}>
              {washType}
            </Text>
            <Text
              style={{
                fontSize: 20,
                color: "white",
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              wash
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default OwnerBookingSingle;
