import React from "react";
import {
  Text,
  View,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { connect } from "react-redux";
import ReviewSingleItem from "../components/ReviewSingleItem";
import firebase from "firebase";
import colors from "../style";
import { Icon } from "react-native-elements";
import LoadScreen from "../components/LoadScreen";

let reviewsArray = [];
class Reviews extends React.Component {
  static navigationOptions = {
    title: "Reviews",
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
    reviews: [],
    loading: true,
  };
  componentDidMount() {
    const { userId } = this.props.user;
    const { reviews } = this.props.navigation.state.params;
    console.log(reviews);
    if (reviews === undefined) {
      firebase
        .firestore()
        .collection("reviews")
        .where("washerId", "==", userId)
        .get()
        .then(async (reviewsResponse) => {
          await reviewsResponse.forEach(function (reviewDoc) {
            console.log(reviewDoc.id, " => ", reviewDoc.data());
            reviewsArray.push(reviewDoc.data());
          });
          this.setState({
            reviews: reviewsArray === undefined ? [] : reviewsArray,
            loading: false,
          });
          reviewsArray = [];
        })
        .catch((err) => {
          this.setState({ loading: false });
        });
      return;
    }
    this.setState({ reviews, loading: false });
  }
  render() {
    const { reviews, loading } = this.state;
    console.log(reviews);
    if (loading) return <LoadScreen text="Loading reviews" />;
    const reviewsSingleArray = reviews.map((review, index) => {
      return <ReviewSingleItem reviewDetail={review} />;
    });
    return (
      <SafeAreaView style={{ flex: 1, flexDirection: "column" }}>
        <ScrollView>
          {reviews.length === 0 && (
            <Text
              style={{
                fontSize: 24,
                alignSelf: "center",
                marginTop: "75%",
                color: colors.accent,
              }}
            >
              No reviews yet.
            </Text>
          )}
          {reviewsSingleArray}
        </ScrollView>
      </SafeAreaView>
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

export default connect(mapStateToProps)(Reviews);
