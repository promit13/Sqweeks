import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  Switch,
  Alert
} from "react-native";
import { Button, Input, Icon, Avatar, Rating } from "react-native-elements";
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from "react-native-maps";
import { TouchableHighlight } from "react-native-gesture-handler";
import ModalSelector from "react-native-modal-selector";
import Swiper from "react-native-swiper";
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
import { connect } from "react-redux";
import * as geofirex from "geofirex";
import firebase from "react-native-firebase";
import logo from "../../assets/logo-shadow.png";
import UserDetails from "../components/UserDetails";
import colors from "../style";
import * as Animatable from "react-native-animatable";

const cutLogo = require("../../assets/cutLogo.png");

const { geolocation } = navigator;

const washTypes = [
  { key: "bronze", label: "Bronze wash" },
  { key: "silver", label: "Silver wash" },
  { key: "gold", label: "Gold wash" }
];

const carTypes = [
  { key: "small", label: "Small car" },
  { key: "medium", label: "Medium car" },
  { key: "large", label: "Large car" }
];

const washDetail = {
  bronze: {
    one: {
      title: "Bronze Wax",
      description: "jfjaskdj kjfasjdf jdfkjaslk jdfkjdfkj askdjjdwjjsd"
    },
    two: {
      title: "Wash & Wax",
      description: "jfjaskdj kjfasjdf jdfkjaslk jdfkjdfkj askdjjdwjjsd"
    },
    three: {
      title: "Your booking gets confirmed",
      description: "jfjaskdj kjfasjdf jdfkjaslk jdfkjdfkj askdjjdwjjsd"
    }
  },
  silver: {
    one: {
      title: "Silver Wax",
      description: "jfjaskdj kjfasjdf jdfkjaslk jdfkjdfkj askdjjdwjjsd"
    },
    two: {
      title: "They tell you when it's done",
      description: "jfjaskdj kjfasjdf jdfkjaslk jdfkjdfkj askdjjdwjjsd"
    },
    three: {
      title: "Rate & Share",
      description: "jfjaskdj kjfasjdf jdfkjaslk jdfkjdfkj askdjjdwjjsd"
    }
  },
  gold: {
    one: {
      title: "Gold Clean",
      description: "jfjaskdj kjfasjdf jdfkjaslk jdfkjdfkj askdjjdwjjsd"
    },
    two: {
      title: "Wash",
      description: "jfjaskdj kjfasjdf jdfkjaslk jdfkjdfkj askdjjdwjjsd"
    },
    three: {
      title: "Rate",
      description: "jfjaskdj kjfasjdf jdfkjaslk jdfkjdfkj askdjjdwjjsd"
    },
    four: {
      title: "Share",
      description: "jfjaskdj kjfasjdf jdfkjaslk jdfkjdfkj askdjjdwjjsd"
    }
  }
};

const washPrice = {
  gold: {
    small: 30,
    medium: 40,
    large: 50
  },
  silver: {
    small: 25,
    medium: 35,
    large: 45
  },
  bronze: {
    small: 20,
    medium: 30,
    large: 40
  }
};

const styles = {
  slideStyle: {
    backgroundColor: "black",
    width: 200,
    height: 200,
    alignItems: "center",
    padding: 10,
    alignSelf: "center"
  },
  sliderTextStyle: {
    color: "white",
    fontSize: 16
  },
  triangle: {
    width: 0,
    height: 0,
    marginTop: 30,
    backgroundColor: "transparent",
    borderStyle: "solid",
    alignSelf: "center",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "black"
  }
};

const washersData = {
  1: {
    fullName: "Ovidiu Balau",
    aboutMe:
      "My name is Ovi. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    rating: "5.0",
    totalWashes: "80",
    totalPhotos: "300",
    totalReviews: "200",
    profilePicUrl:
      "https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg",
    uid: "8Mmd82uZPeWkEJ4GiGyRrcfO2bx2",
    messagingToken:
      "cck74KTn2BQ:APA91bFjIAk7S3kwdwjLdbAhnzHUP7vl222FksM4b-h6rsQ4RDulhu2kG5belJhfKIzMXpJr3zlctu3YSr7bULkrmGSF1XBDYw1hc9f6aOiwVEtyzOA9rFpKcN5FsEJLReGb-gUbk910",
    location: {
      latitude: 51.59,
      longitude: 0.339
    },
    images: [
      "https://www.gstatic.com/webp/gallery/1.jpg",
      "https://www.gstatic.com/webp/gallery/2.jpg",
      "https://www.gstatic.com/webp/gallery/3.jpg",
      "https://www.gstatic.com/webp/gallery/4.jpg",
      "https://www.gstatic.com/webp/gallery/5.jpg",
      "https://www.gstatic.com/webp/gallery/1.jpg",
      "https://www.gstatic.com/webp/gallery/2.jpg",
      "https://www.gstatic.com/webp/gallery/3.jpg",
      "https://www.gstatic.com/webp/gallery/4.jpg",
      "https://www.gstatic.com/webp/gallery/5.jpg"
    ]
  },
  2: {
    fullName: "Promit Rai",
    aboutMe:
      "My name is Promit. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    rating: "4.0",
    totalWashes: "50",
    totalPhotos: "200",
    totalReviews: "100",
    profilePicUrl: "https://www.gstatic.com/webp/gallery/1.jpg",
    uid: "K2j4XqTdEfWIfhJejMVLidKMfJ83",
    messagingToken:
      "cck74KTn2BQ:APA91bFjIAk7S3kwdwjLdbAhnzHUP7vl222FksM4b-h6rsQ4RDulhu2kG5belJhfKIzMXpJr3zlctu3YSr7bULkrmGSF1XBDYw1hc9f6aOiwVEtyzOA9rFpKcN5FsEJLReGb-gUbk910",
    location: {
      latitude: 51.58,
      longitude: 0.34
    },
    images: [
      "https://www.gstatic.com/webp/gallery/5.jpg",
      "https://www.gstatic.com/webp/gallery/3.jpg",
      "https://www.gstatic.com/webp/gallery/1.jpg",
      "https://www.gstatic.com/webp/gallery/4.jpg",
      "https://www.gstatic.com/webp/gallery/2.jpg"
    ]
  },
  3: {
    fullName: "Alex Balau",
    aboutMe:
      "My name is Alex. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    rating: "4.7",
    totalWashes: "70",
    totalPhotos: "250",
    totalReviews: "130",
    profilePicUrl: "https://www.gstatic.com/webp/gallery/2.jpg",
    uid: "6tWiEdEWYOhoLJAtP9E8wDnAz103",
    messagingToken:
      "cz7PuAdsZMg:APA91bF0n2VR0qrb4tYVlLbSbUuyOc1ky4p70Lvlw4Q7rwEBgdZdgwDo6ODYZjNDPITmI0fHYD6w5GaQr3J64z77tsdKlD_At7VPofQdxS0bCmwivFl3RuINKQ1kQY6S8Lfw0LIFYfqV",
    location: {
      latitude: 51.57,
      longitude: 0.35
    },
    images: [
      "https://www.gstatic.com/webp/gallery/5.jpg",
      "https://www.gstatic.com/webp/gallery/3.jpg",
      "https://www.gstatic.com/webp/gallery/1.jpg",
      "https://www.gstatic.com/webp/gallery/4.jpg",
      "https://www.gstatic.com/webp/gallery/2.jpg"
    ]
  }
};

class Map extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    };
  };
  state = {
    places: [],
    isDateTimePickerVisible: false,
    location: {},
    date: null,
    washType: "silver",
    carType: "medium",
    renderSearchBox: false,
    showCanelButton: true
  };

  componentDidMount() {
    console.log("MAP", this.props.user);
    const geo = geofirex.init(firebase);
    geolocation.requestAuthorization();
    geolocation.getCurrentPosition(pos => {
      console.log(pos);
      const { latitude, longitude } = pos.coords;
      this.setState({
        location: {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }
      });
    });
  }

  handleDatePicked = date => {
    console.log("A date has been picked: ", date);
    const formattedDate = moment(date).format("MMM Do - hh:mm");
    this.setState({
      date: formattedDate,
      isDateTimePickerVisible: false
    });
  };

  _renderItem = () => {
    const { washType } = this.state;
    console.log(washType);
    const washData =
      washType === "silver"
        ? washDetail.silver
        : washType === "bronze"
        ? washDetail.bronze
        : washDetail.gold;
    const washDetailList = Object.entries(washData).map(([key, value], i) => {
      return (
        <View style={{ height: 200 }}>
          <View style={styles.triangle} />
          <View style={styles.slideStyle} key={key}>
            <Text style={styles.sliderTextStyle}>{value.title}</Text>
            <Text
              style={[styles.sliderTextStyle, { fontSize: 12, marginTop: 10 }]}
            >
              {value.description}
            </Text>
          </View>
        </View>
      );
    });
    return washDetailList;
  };

  renderDot = () => {
    return (
      <View
        style={{
          backgroundColor: "#B6B6B6",
          width: 20,
          height: 3,
          marginRight: 10
        }}
      />
    );
  };

  carWashPrice = () => {
    const { carType, washType } = this.state;
    let price = "";
    if (washType === "silver") {
      if (carType === "small") {
        price = washPrice.silver.small;
      } else if (carType === "medium") {
        price = washPrice.silver.medium;
      } else if (carType === "large") {
        price = washPrice.silver.large;
      }
    } else if (washType === "bronze") {
      if (carType === "small") {
        price = washPrice.bronze.small;
      } else if (carType === "medium") {
        price = washPrice.bronze.medium;
      } else if (carType === "large") {
        price = washPrice.bronze.large;
      }
    } else if (washType === "gold") {
      if (carType === "small") {
        price = washPrice.gold.small;
      } else if (carType === "medium") {
        price = washPrice.gold.medium;
      } else if (carType === "large") {
        price = washPrice.gold.large;
      }
    }
    return price;
  };

  renderMarkers = price => {
    const { carType, washType, date } = this.state;
    const markers = Object.entries(washersData).map(([key, value], i) => {
      const {
        fullName,
        rating,
        profilePicUrl,
        totalWashes,
        totalReviews,
        totalPhotos,
        location
      } = value;
      return (
        <Marker coordinate={location}>
          <Image
            resizeMode="contain"
            source={require("../../assets/logo-shadow.png")}
            style={{ height: 65 }}
          />
          <Callout
            style={{ background: "transparent" }}
            onPress={() => {
              this.props.navigation.navigate("Profile", {
                washerDetail: value,
                user: this.props.user,
                carType,
                washType,
                date,
                price
              });
            }}
          >
            <View
              style={{
                alignSelf: "center",
                borderWidth: 2
              }}
            >
              <UserDetails washerDetail={value} />
            </View>
          </Callout>
        </Marker>
      );
    });
    return markers;
  };

  render() {
    const { renderSearchBox, showCanelButton } = this.state;
    const price = this.carWashPrice();
    console.log(price);
    return (
      <View>
        {renderSearchBox ? (
          <Animatable.View
            animation={showCanelButton ? "slideOutDown" : "slideInUp"}
            style={{
              position: "absolute",
              zIndex: 2,
              top: 100,
              alignSelf: "center",
              alignItems: "center",
              width: "85%",
              height: 690,
              paddingHorizontal: 18,
              marginHorizontal: 35,
              paddingVertical: 10,
              backgroundColor: colors.accent,
              borderTopLeftRadius: 90,
              borderTopRightRadius: 90
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 50,
                fontWeight: "700",
                width: 300,
                paddingTop: 50,
                paddingBottom: 10,
                alignItems: "center",
                textAlign: "center"
              }}
            >
              {`£${price}.00`}
            </Text>
            <TouchableOpacity
              onPress={() => this.setState({ isDateTimePickerVisible: true })}
              style={{
                backgroundColor: "white",
                borderWidth: 0,
                borderBottomColor: "transparent",
                display: "flex",
                flexDirection: "row",
                width: "80%",
                borderRadius: 50,
                marginTop: 10,
                marginHorizontal: 35,
                height: 45,
                paddingHorizontal: 15,
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 5
                },
                shadowOpacity: 0.34,
                shadowRadius: 6.27,

                elevation: 10
              }}
            >
              <DateTimePicker
                isVisible={this.state.isDateTimePickerVisible}
                onConfirm={this.handleDatePicked}
                mode="datetime"
                onCancel={() =>
                  this.setState({ isDateTimePickerVisible: false })
                }
              />

              <Text
                style={{
                  fontSize: 18,
                  flex: 4,
                  alignSelf: "center",
                  textAlign: "center",
                  alignSelf: "center"
                }}
              >
                {this.state.date || "Date/Time"}
              </Text>
              <Icon
                name="angle-down"
                type="font-awesome"
                color="black"
                containerStyle={{ flex: 1, justifyContent: "center" }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                borderBottomColor: "transparent",
                display: "flex",
                flexDirection: "row",
                width: "80%",
                borderRadius: 50,
                marginTop: 10,
                marginHorizontal: 35,
                height: 45,
                border: 0,
                paddingHorizontal: 15,
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 5
                },
                shadowOpacity: 0.34,
                shadowRadius: 6.27,

                elevation: 10
              }}
            >
              <ModalSelector
                selectStyle={{ borderColor: "transparent" }}
                overlayStyle={{ backgroundColor: colors.accent }}
                optionTextStyle={{ color: colors.accent }}
                selectTextStyle={{
                  color: "black",
                  textAlign: "center",
                  alignSelf: "center",
                  fontSize: 18
                }}
                style={{ flex: 4 }}
                data={washTypes}
                initValue="Silver"
                onChange={option => {
                  this.setState({ washType: option.key });
                }}
              />
              <Icon
                name="angle-down"
                type="font-awesome"
                color="black"
                containerStyle={{ flex: 1, justifyContent: "center" }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                borderBottomColor: "transparent",
                display: "flex",
                flexDirection: "row",
                width: "80%",
                borderRadius: 50,
                marginTop: 10,
                marginHorizontal: 35,
                height: 45,
                border: 0,
                paddingHorizontal: 15,
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 5
                },
                shadowOpacity: 0.34,
                shadowRadius: 6.27,

                elevation: 10
              }}
            >
              <ModalSelector
                selectStyle={{ borderColor: "transparent" }}
                selectTextStyle={{
                  color: "black",
                  textAlign: "center",
                  alignSelf: "center",
                  fontSize: 18
                }}
                style={{ flex: 4 }}
                data={carTypes}
                initValue="Medium car"
                onChange={option => {
                  this.setState({ carType: option.key });
                }}
              />
              <Icon
                name="angle-down"
                type="font-awesome"
                color="black"
                containerStyle={{ flex: 1, justifyContent: "center" }}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.sliderTextStyle,
                { marginTop: 10, fontWeight: "bold" }
              ]}
            >
              Included with wash
            </Text>
            <View style={{ height: 200 }}>
              <Swiper
                loop
                // showsButtons // shows side arrows
                dot={this.renderDot()}
                activeDotColor="white"
                activeDotStyle={{ width: 20, height: 3, marginRight: 10 }}
                paginationStyle={{ position: "absolute", top: -120 }}
              >
                {this._renderItem()}
              </Swiper>
            </View>
            <TouchableOpacity
              style={{
                height: 80,
                width: 80,
                borderRadius: 40,
                backgroundColor: "white",
                borderWidth: 23,
                borderColor: "white",
                marginTop: 30,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 12
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,

                elevation: 24
              }}
              onPress={() => this.setState({ showCanelButton: true })}
            >
              <Image
                style={{
                  alignSelf: "center",
                  justifyContent: "center"
                }}
                source={cutLogo}
              />
            </TouchableOpacity>
          </Animatable.View>
        ) : null}

        <View style={{ display: "flex", justifyContent: "center" }}>
          <MapView
            showsUserLocation
            showsMyLocationButton
            style={{ width: "100%", height: "100%" }}
            region={this.state.location}
          >
            {this.renderMarkers(price)}
          </MapView>
        </View>
        {showCanelButton ? (
          <Animatable.View animation="slideInUp" duration={20}>
            <TouchableOpacity
              onPress={() =>
                this.setState({ renderSearchBox: true, showCanelButton: false })
              }
              style={{
                position: "absolute",
                justifyContent: "center",
                alignSelf: "center",
                alignContent: "center",
                bottom: 20,
                height: 80,
                width: 80,
                borderRadius: 40,
                backgroundColor: "white",
                borderWidth: 23,
                borderColor: "white",
                marginVertical: 30,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 12
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,

                elevation: 24
              }}
            >
              <Image
                style={{
                  alignSelf: "center",
                  justifyContent: "center"
                }}
                source={cutLogo}
              />
            </TouchableOpacity>
          </Animatable.View>
        ) : null}
      </View>
    );
  }
}

const mapStateToProps = ({ checkUser }) => {
  const { user } = checkUser;
  console.log("MAP RED", user);
  return {
    user
  };
};

export default connect(mapStateToProps)(Map);
