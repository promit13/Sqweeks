import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import StarRating from "react-native-star-rating";

import colors from "../style";

const UserDetails = ({ washerDetail }) => {
  const { fullName, rating } = washerDetail;
  return (
    <View>
    <Text
      style={{
        fontSize: 20,
        color: "white",
        alignText: "center",
        fontWeight: "700",
        alignContent: "center",
        alignSelf: "center",
        marginTop: 20
      }}
    >
      {fullName}
    </Text>

    <StarRating
      containerStyle={{ backgroundColor: colors.accent, marginTop: 10 }}
      starSize={30}
      maxStars={5}
      starStyle={{ color: "white", fullStarColor: "yellow" }}
      rating={rating}
    />

    <TouchableOpacity
      style={{
        justifyContent: "center",
        height: 40,
        width: 100,
        borderRadius: 40,
        backgroundColor: "white",
        alignSelf: "center",
        alignContent: "center",
        alignItems: "center",
        marginTop: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 7
        },
        shadowOpacity: 0.43,
        shadowRadius: 9.51,

        elevation: 15
      }}
    >
      <Text>Book me</Text>
    </TouchableOpacity>
  </View>
  )
};

export default UserDetails;
