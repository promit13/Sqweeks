import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { Input, Icon } from "react-native-elements";
import MapView, { Marker, Callout } from "react-native-maps";
import ModalSelector from "react-native-modal-selector";
import Swiper from "react-native-swiper";
import DateTimePicker from "react-native-modal-datetime-picker";
import { moderateScale } from "react-native-size-matters";
import moment from "moment";
import { connect } from "react-redux";
import * as Animatable from "react-native-animatable";
import axios from "axios";
import ErrorMessage from "../components/Error";
import UserDetails from "../components/UserDetails";
import colors from "../style";
import LoadScreen, { ModalLoading } from "../components/LoadScreen";
import ShowModal from "../components/ShowModal";

const Logo = require("../../assets/logo-shadow.png");

import firebase from "react-native-firebase";
import { geo, GOOGLE_API } from "../utils/firebase";
const { geolocation } = navigator;

const washTypes = [
  { key: "Bronze", label: "Bronze wash" },
  { key: "Silver", label: "Silver wash" },
  { key: "Gold", label: "Gold wash" },
  { key: "Platinum", label: "Platinum wash" },
  { key: "Premium", label: "Premium Full Valet wash" },
];

const carTypes = [
  { key: "Small", label: "Small car" },
  { key: "Medium", label: "Medium car" },
  { key: "Large", label: "Large car" },
];

const washDetail = {
  bronze: ["Outside wash", "Trims", "Wheels cleaned", "30 minutes"],
  silver: [
    "Outside wash and wax",
    "Inside hover",
    "Trims in and out",
    "45 minutes",
  ],
  gold: [
    "Outside Wash and Wax",
    "Hand polished",
    "Inside Hoover",
    "Trims in and out",
    "60 minutes",
  ],
  platinum: ["Mini-valet", "Hand polish", "Seat clean", "90 minutes"],
  premium: [
    "Full valet in and out",
    "Hand polish and machine buffed",
    "Mats washed",
    "Seats washed",
    "2.5 hours",
  ],
};

const washPrice = {
  bronze: {
    small: 12,
    medium: 15,
    large: 18,
  },
  silver: {
    small: 18,
    medium: 22,
    large: 24,
  },
  gold: {
    small: 22,
    medium: 27,
    large: 33,
  },
  platinum: {
    small: 30,
    medium: 36,
    large: 45,
  },
  premium: {
    small: 50,
    medium: 60,
    large: 75,
  },
};

const styles = {
  slideStyle: {
    backgroundColor: "black",
    width: 200,
    height: 200,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 60,
    alignSelf: "center",
  },
  sliderTextStyle: {
    color: "white",
    fontSize: 20,
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
    borderBottomColor: "black",
  },
  touchableOpactityStyle: {
    backgroundColor: "white",
    borderWidth: 0,
    borderBottomColor: "transparent",
    display: "flex",
    flexDirection: "row",
    width: "80%",
    borderRadius: 50,
    marginHorizontal: 35,
    height: 45,
    paddingHorizontal: 15,
    justifyContent: "center",
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
class Map extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };
  state = {
    isDateTimePickerVisible: false,
    location: {},
    date: null,
    dateInMS: 0,
    washType: "",
    carType: "",
    renderSearchBox: true,
    showCanelButton: false,
    bookedSchedule: [],
    availableWashers: [],
    where: "",
    showErrorMessage: false,
    errorMessage: "",
    loading: false,
    loadModal: false,
    whereLocaiton: {},
    addressSearched: false,
    markersToRender: [],
    showNoWasherModal: false,
    modalText: "",
  };

  componentDidMount() {
    const platform = Platform.OS;
    platform === "android"
      ? this.requestPermission()
      : geolocation.requestAuthorization();
    geolocation.getCurrentPosition((pos) => {
      console.log(pos);
      const { latitude, longitude } = pos.coords;
      this.setState({
        location: {
          latitude,
          longitude,
        },
        loading: false,
      });
    });
  }

  // requests user to access device location
  requestPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message:
            "Sqweeks needs to access your location" +
            "so you can search for car washers.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can access location");
      } else {
        console.log("Location access denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // retrieves properly formatted address detail using google api based on location provided and sets to state
  handleAddressSubmit = () => {
    const { where } = this.state;
    axios
      .get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          key: GOOGLE_API,
          address: where,
          region: "GB",
        },
      })
      .then((res) => {
        const { results } = res.data;
        if (results.length === 0) {
          this.setState({
            loadModal: false,
            errorMessage: "Please enter correct postcode",
            showErrorMessage: true,
          });
          return;
        }
        console.log(res);
        results.forEach((result) => {
          axios
            .get("https://maps.googleapis.com/maps/api/place/details/json", {
              params: {
                key: GOOGLE_API,
                placeid: result.place_id,
                inputtype: "textquery",
                region: "GB",
                fields: "formatted_address,geometry,name,photos",
              },
            })
            .then((place) => {
              console.log(place);
              const { result } = place.data;
              const { lat, lng } = result.geometry.location;
              this.setState({
                where: result.formatted_address,
                location: {
                  latitude: lat,
                  longitude: lng,
                  // latitudeDelta: 0.0922,
                  // longitudeDelta: 0.0421
                },
                loadModal: false,
                addressSearched: true,
                errorMessage: "",
                showErrorMessage: false,
              });
            })
            .catch((er) => {
              this.setState({
                loadModal: false,
                errorMessage: "Something went wrong. Please try again",
                showErrorMessage: true,
              });
              console.log(er);
            });
        });
      })
      .catch((err) => {
        this.setState({
          loadModal: false,
          errorMessage: "Something went wrong. Please try again",
          showErrorMessage: true,
        });
        console.log(err);
      });
  };

  // formats selected date and sets to state
  handleDatePicked = (date) => {
    const formattedDate = moment(date).format("MMM Do - hh:mm");
    console.log(date.getTime());
    this.setState({
      date: formattedDate,
      dateInMS: date.getTime(),
      isDateTimePickerVisible: false,
      showErrorMessage: false,
    });
  };

  // renders view for wash detail
  _renderItem = () => {
    const { washType } = this.state;
    console.log(washType);
    const washData =
      washType === "" ? washDetail.gold : washDetail[washType.toLowerCase()];
    const washDetailList = washData.map((key, i) => {
      return (
        <View>
          <View style={styles.triangle} />
          <View style={styles.slideStyle} key={key}>
            <Text style={styles.sliderTextStyle}>{key}</Text>
          </View>
        </View>
      );
    });
    return washDetailList;
  };

  // renders customized dot for swiper
  renderDot = () => {
    return (
      <View
        style={{
          backgroundColor: "#B6B6B6",
          width: 20,
          height: 3,
          marginRight: 10,
        }}
      />
    );
  };

  // searches for all the available car washers
  searchCarWashers = () => {
    let geoUserIdArray = [];
    let geoUserDetailArray = [];
    let bookedWasherIdArray = [];
    let washerToShow = [];
    let markersToRender = [];

    const {
      carType,
      washType,
      date,
      dateInMS,
      addressSearched,
      where,
      location,
    } = this.state;
    if (date === null) {
      return this.setState({
        errorMessage: "Select date",
        showErrorMessage: true,
      });
    }
    if (washType === "") {
      return this.setState({
        errorMessage: "Select wash type",
        showErrorMessage: true,
      });
    }
    if (carType === "") {
      return this.setState({
        errorMessage: "Select car type",
        showErrorMessage: true,
      });
    }
    if (where === "") {
      return this.setState({
        errorMessage: "Enter location",
        showErrorMessage: true,
      });
    }
    if (!addressSearched) {
      return this.setState({
        errorMessage: "Please search for the address",
        showErrorMessage: true,
      });
    }
    this.setState({
      loading: true,
    });
    const { latitude, longitude } = location;
    const center = geo.point(latitude, longitude);
    const dayOfWeek = moment(dateInMS).format("dddd");
    const convertedTime = moment(dateInMS).format("HH:mm:ss");
    geo
      .collection("users")
      .within(center, 5, "location")
      .subscribe(async (res) => {
        await res.map((item, index) => {
          const { workingHours, userType } = item;
          if (userType === true) {
            const workingTime = workingHours[0][dayOfWeek];
            const checkTime = moment(convertedTime, "HH:mm:ss");
            const beforeTime = moment(workingTime[0], "HH:mm:ss");
            const afterTime = moment(workingTime[1], "HH:mm:ss");
            const isBetween = checkTime.isBetween(beforeTime, afterTime);
            if (isBetween) {
              geoUserIdArray.push(item.id);
              geoUserDetailArray.push(item);
            }
          }
        });
        firebase
          .firestore()
          .collection("bookings")
          .get()
          .then(async (querySnapshot) => {
            // if (querySnapshot.docs.length === 0) {
            //   // this.setState({
            //   //   loading: false,
            //   //   showNoWasherModal: true,
            //   //   modalText: "No washers available in this area",
            //   // });
            //   return;
            // }
            await querySnapshot.forEach(function (doc) {
              const booking = doc.data();
              const { status, washerId, bookedHours } = booking;
              if (status === "accepted") {
                const check =
                  dateInMS > bookedHours[0] && dateInMS < bookedHours[1]
                    ? true
                    : false;
                console.log(check);
                if (check) {
                  const included = bookedWasherIdArray.includes(washerId);
                  if (!included) {
                    bookedWasherIdArray.push(washerId);
                  }
                }
              }
            });
            console.log(bookedWasherIdArray);

            await geoUserIdArray.map(async (washerId, ind) => {
              const washerIdIncluded = bookedWasherIdArray.includes(washerId);
              if (!washerIdIncluded) {
                const washerDetail = geoUserDetailArray[ind];
                const { latitude, longitude } = washerDetail.location;
                const placeMarker = {
                  latitude,
                  longitude,
                  key: ind + 1,
                };
                markersToRender.push(placeMarker);
                washerToShow.push(washerDetail);
              }
            });

            console.log(washerToShow);
            this.setState({
              availableWashers: washerToShow,
              loading: false,
              markersToRender,
              renderSearchBox: washerToShow.length === 0 ? true : false,
              showNoWasherModal: washerToShow.length === 0 ? true : false,
              showCanelButton: true,
              modalText: "No washers available in this area",
            });
          })
          .catch((err) => console.log(err));
      });
  };

  // render markers for each car washers found
  renderMarkers = (price) => {
    const {
      carType,
      washType,
      date,
      dateInMS,
      availableWashers,
      where,
    } = this.state;
    console.log(availableWashers);
    if (availableWashers.length === 0) {
      return;
    }
    const markers = availableWashers.map((value, i) => {
      const { location } = value;
      const { latitude, longitude } = location;
      return (
        <Marker coordinate={{ latitude, longitude }} draggable>
          <Image
            resizeMode="contain"
            source={require("../../assets/logo-shadow.png")}
            style={{ height: 65, borderRadius: 20, flex: 1 }}
            identifier={i}
          />
          <Callout
            style={{
              backgroundColor: colors.accent,
              height: 155,
              width: 180,
              borderRadius: 5,
            }}
            onPress={() => {
              this.props.navigation.navigate("Profile", {
                washerDetail: value,
                user: this.props.user,
                carType,
                washType,
                date,
                dateInMS,
                price,
                location,
                where,
              });
            }}
          >
            <View
              style={{
                alignSelf: "center",

                backgroundColor: "colors.accent",
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
    const {
      renderSearchBox,
      showCanelButton,
      showErrorMessage,
      errorMessage,
      loading,
      markersToRender,
      where,
      loadModal,
      carType,
      washType,
      showNoWasherModal,
      modalText,
    } = this.state;
    const price =
      washType === "" || carType === ""
        ? 0
        : washPrice[washType.toLowerCase()][carType.toLowerCase()];
    if (loading) return <LoadScreen text="Plase wait" />;
    return (
      <View>
        {renderSearchBox ? (
          <Animatable.View
            animation={showCanelButton ? "slideOutDown" : "slideInUp"}
            style={{
              position: "absolute",
              zIndex: 2,
              top: 50,
              alignSelf: "center",
              bottom: 0,
              alignItems: "center",
              width: "85%",

              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 7,
              },
              shadowOpacity: 0.43,
              shadowRadius: 9.51,
              elevation: 15,
              backgroundColor: colors.accent,
              borderTopLeftRadius: 90,
              borderTopRightRadius: 90,
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center" }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: moderateScale(50),
                  fontWeight: "700",
                  paddingTop: 20,
                  paddingBottom: 10,
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                {`£${price}.00`}
              </Text>
              {showErrorMessage && <ErrorMessage errorMessage={errorMessage} />}
              <TouchableOpacity
                onPress={() => this.setState({ isDateTimePickerVisible: true })}
                style={styles.touchableOpactityStyle}
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
                    alignSelf: "center",
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
                style={[styles.touchableOpactityStyle, { marginTop: 10 }]}
              >
                <ModalSelector
                  selectStyle={{ borderColor: "transparent" }}
                  selectTextStyle={{
                    color: "black",
                    textAlign: "center",
                    alignSelf: "center",
                    fontSize: 18,
                  }}
                  style={{ flex: 4 }}
                  data={washTypes}
                  initValue="Wash Type"
                  initValueTextStyle={{
                    color: "black",
                    textAlign: "center",
                    marginTop: 2,
                  }}
                  onChange={(option) => {
                    this.setState({
                      washType: option.key,
                      showErrorMessage: false,
                    });
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
                style={[styles.touchableOpactityStyle, { marginTop: 10 }]}
              >
                <ModalSelector
                  selectStyle={{ borderColor: "transparent" }}
                  selectTextStyle={{
                    color: "black",
                    textAlign: "center",
                    alignSelf: "center",
                    fontSize: 18,
                  }}
                  style={{ flex: 4 }}
                  data={carTypes}
                  initValue="Car Size"
                  initValueTextStyle={{
                    color: "black",
                    textAlign: "center",
                    marginTop: 2,
                  }}
                  onChange={(option) => {
                    this.setState({
                      carType: option.key,
                      showErrorMessage: false,
                    });
                  }}
                />
                <Icon
                  name="angle-down"
                  type="font-awesome"
                  color="black"
                  containerStyle={{ flex: 1, justifyContent: "center" }}
                />
              </TouchableOpacity>
              <Input
                rightIcon={
                  <Icon
                    name="arrow-right-circle"
                    type="feather"
                    color="black"
                    iconStyle={{
                      marginRight: 15,
                      alignContent: "flex-start",
                    }}
                    onPress={() => {
                      this.handleAddressSubmit();
                    }}
                  />
                }
                containerStyle={{
                  backgroundColor: "white",
                  borderWidth: 0,
                  borderBottomColor: "transparent",
                  width: "80%",
                  borderRadius: 45,
                  marginTop: 10,
                  marginHorizontal: 35,
                  height: 45,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 7,
                  },
                  shadowOpacity: 0.43,
                  shadowRadius: 9.51,

                  elevation: 15,
                }}
                inputStyle={{
                  height: 45,
                  textAlign: "center",
                }}
                inputContainerStyle={{
                  borderBottomWidth: 0,
                  height: 45,
                }}
                placeholder="Postcode"
                placeholderTextColor="black"
                onChangeText={(where) =>
                  this.setState({ where, addressSearched: false })
                }
                value={where}
              />
              {loadModal && <ModalLoading text="Getting address" />}
              <Text
                style={[
                  styles.sliderTextStyle,
                  { marginTop: 10, fontWeight: "bold", textAlign: "center" },
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
                  alignContent: "center",
                  alignItems: "center",
                  justifyContent: "center",
                  marginVertical: 20,
                  alignSelf: "center",
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 12,
                  },
                  shadowOpacity: 0.58,
                  shadowRadius: 16.0,
                  elevation: 24,
                }}
                onPress={() => {
                  this.searchCarWashers();
                }}
              >
                <Image
                  style={{
                    alignSelf: "center",
                    justifyContent: "center",
                    width: 25,
                    height: 30,
                  }}
                  source={Logo}
                />
              </TouchableOpacity>
              {showNoWasherModal ? (
                <ShowModal
                  showModal={showNoWasherModal}
                  onPress={() =>
                    this.setState({
                      showNoWasherModal: false,
                      renderSearchBox: true,
                    })
                  }
                  modalText={modalText}
                />
              ) : null}
            </ScrollView>
          </Animatable.View>
        ) : null}

        <MapView
          style={{ width: "100%", height: "100%" }}
          region={this.state.location}
          ref={(ref) => {
            this.mapRef = ref;
          }}
          onMapReady={() =>
            this.mapRef.fitToCoordinates(markersToRender, {
              edgePadding: { top: 50, right: 10, bottom: 10, left: 10 },
              animated: false,
            })
          }
        >
          {this.renderMarkers(price)}
        </MapView>

        {showCanelButton ? (
          <View animation="slideInUp" duration={100}>
            <TouchableOpacity
              onPress={() =>
                this.setState({
                  renderSearchBox: true,
                  showCanelButton: false,
                })
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
                marginVertical: 10,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 12,
                },
                shadowOpacity: 0.58,
                shadowRadius: 16.0,
                elevation: 24,
              }}
            >
              <Image
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  width: 25,
                  height: 25,
                }}
                source={Logo}
              />
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
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

export default connect(mapStateToProps)(Map);
