import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Avatar, Icon } from "react-native-elements";
import colors from "../style";
const BookingDetails = ({ user, booking }) => (
  <View
    style={{
      borderWidth: 2,
      flexDirection: "column",
      width: "80%",
      alignSelf: "center"
    }}
  >
    <View
      style={{
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
        alignContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "black",
        paddingHorizontal: 10,
        paddingVertical: 10
      }}
    >
      <Avatar
        rounded
        size="small"
        source={{
          uri: "https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg"
        }}
        avatarStyle={{ flex: 1 }}
      />

      <View
        style={{
          flex: 3,
          paddingHorizontal: 10,
          alignContent: "center",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Text
          style={{
            fontWeight: "700",
            fontSize: 16
          }}
        >
          {user.name}
        </Text>
      </View>
      <Icon
        name="arrow-circle-right"
        type="font-awesome"
        color={colors.accent}
        containerStyle={{ flex: 1, alignSelf: "center" }}
      />
    </View>
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between"
      }}
    >
      <View
        style={{
          flexDirection: "column",
          borderRightWidth: 1,
          width: "25%",
          alignItems: "center",
          paddingVertical: 25
        }}
      >
        <Text style={{ fontWeight: "600" }}>{booking.date}</Text>
        <Text style={{ fontWeight: "600" }}>DEC</Text>
      </View>
      <View
        style={{
          flexDirection: "column",
          width: "25%",
          borderRightWidth: 1,
          justifyContent: "center",
          alignSelf: "center",
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 25
        }}
      >
        <Text style={{ fontWeight: "600" }}>{booking.date}</Text>
        <Text style={{ fontWeight: "600" }}>PM</Text>
      </View>
      <View
        style={{
          flexDirection: "column",
          borderRightWidth: 1,
          width: "25%",
          paddingVertical: 25,
          alignItems: "center"
        }}
      >
        <Text style={{ fontWeight: "600" }}>{booking.price}</Text>
        <Text style={{ fontWeight: "600" }}>INC VAT</Text>
      </View>
      <View
        style={{
          flexDirection: "column",
          width: "25%",
          alignItems: "center",
          paddingVertical: 25
        }}
      >
        <Text style={{ fontWeight: "600" }}>{booking.length}</Text>
        <Text style={{ fontWeight: "600" }}>MINS</Text>
      </View>
    </View>
  </View>
);
export default BookingDetails;
