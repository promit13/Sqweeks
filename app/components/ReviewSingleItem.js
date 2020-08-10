import React from "react";
import { Text, Dimensions, View } from "react-native";
import { Rating } from "react-native-elements";
import colors from "../style";

var { width } = Dimensions.get("window");

// renders each review item
const ReviewSingleItem = ({ reviewDetail }) => {
  const { createdAt, customerName, review, reviewHeader, star } = reviewDetail;
  return (
    <View
      style={{
        width: width,
        paddingHorizontal: 20,
        paddingVertical: 30,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.accent,
      }}
    >
      <View
        style={{
          justifyContent: "space-around",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "space-between",
            marginLeft: 20,
            marginRight: 20,
          }}
        >
          <View>
            <Text style={{ fontSize: 30, fontWeight: "bold" }}>
              {customerName}
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "100" }}>{createdAt}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Rating
              type="star"
              ratingCount={5}
              startingValue={star}
              imageSize={18}
              // showRating
              readonly
            />
          </View>
        </View>
      </View>
      <Text
        style={{ fontSize: 18, marginTop: 20, marginLeft: 20, marginRight: 20 }}
      >
        {review}
      </Text>
    </View>
  );
};

export default ReviewSingleItem;
