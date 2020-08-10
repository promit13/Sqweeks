import React from "react";
import {
  Text,
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-navigation";
import { Button, Icon } from "react-native-elements";
import { Agenda } from "react-native-calendars";
import { moderateScale } from "react-native-size-matters";
import DateTimePicker from "react-native-modal-datetime-picker";
import { connect } from "react-redux";
import firebase from "react-native-firebase";
import Modal from "react-native-modal";
import moment from "moment";
import colors from "../style";
import LoadScreen from "../components/LoadScreen";
import ErrorMessage from "../components/Error";

var { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  item: {
    backgroundColor: colors.accent,
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    borderRadius: moderateScale(5),
    backgroundColor: colors.accent,
  },
  whiteBackground: {
    backgroundColor: "white",
    borderWidth: 0,
    borderBottomColor: "transparent",
    display: "flex",
    flexDirection: "row",
    width: "80%",
    borderRadius: 50,
    marginHorizontal: 35,
    marginTop: 10,
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
  whiteBackText: {
    fontSize: 18,
    flex: 4,
    alignSelf: "center",
    textAlign: "center",
    alignSelf: "center",
  },
});

let bookingArray = [];
class Jobs extends React.Component {
  static navigationOptions = {
    title: "Calendar",
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
    items: {},
    bookingArray: [],
    loading: true,
    modalVisible: false,
    startPicker: false,
    endPicker: false,
    startDate: null,
    startDateInMS: null,
    endDateInMS: null,
    endDate: null,
    showError: false,
    reload: false,
    bookingToDelete: null,
    renderCancelWarning: false,
    refresh: false,
  };

  componentDidMount() {
    this.getBookings();
  }

  // fetches all the bookings from firebase database
  getBookings = () => {
    bookingArray = [];
    const { userId } = this.props.user;
    firebase
      .firestore()
      .collection("bookings")
      .where("washerId", "==", userId)
      .onSnapshot((querySnapshot) => {
        querySnapshot.forEach(function (doc) {
          console.log(doc.data());
          const { status } = doc.data();
          if (status === "accepted" || status === "completed") {
            bookingArray.push({ ...doc.data(), bookingId: doc.id });
          }
        });
        console.log(bookingArray);
        this.setState({
          bookingArray,
          loading: false,
          reload: false,
          refresh: false,
        });
        bookingArray = [];
      });
  };

  // library(react-native-calendars) function to load all the items for the month amd render the items
  loadItems(dayPassed) {
    console.log(dayPassed);
    const { bookingArray } = this.state;
    console.log(bookingArray);
    const { day, timestamp } = dayPassed;
    setTimeout(() => {
      for (let i = parseInt(`-${day - 1}`); i < 85; i++) {
        const time = timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = this.timeToString(time);
        if (!this.state.items[strTime]) {
          this.state.items[strTime] = [];
          bookingArray.map((item, index) => {
            const {
              date,
              location,
              washType,
              bookingId,
              ownerName,
              requestedBooking,
              duration,
            } = item;
            const formattedDate = moment(date).format("YYYY-MM-DD");
            const bookedTime = moment(date).format("HH:mm");
            if (formattedDate === strTime) {
              this.state.items[strTime].push({
                name: ownerName,
                location,
                washType,
                bookedTime,
                requestedBooking,
                duration,
                bookingId,
              });
            }
          });
        }
      }
      const newItems = {};
      console.log(this.state.items);
      Object.keys(this.state.items).forEach((key) => {
        newItems[key] = this.state.items[key];
      });
      this.setState({
        items: newItems,
      });
    }, 1000);
  }

  // library(react-native-calendars) function to render item for each day
  renderItem(item) {
    const {
      name,
      washType,
      location,
      bookedTime,
      bookingId,
      requestedBooking,
      duration,
    } = item;
    return (
      <TouchableOpacity
        style={[styles.item, { height: 100 }]}
        onPress={() => {
          if (requestedBooking) {
            return;
          }
          this.setState({
            bookingToDelete: bookingId,
            renderCancelWarning: true,
          });
        }}
      >
        {requestedBooking ? (
          <Text>{`${bookedTime}\n${name}\n${washType} Wash\n${location}`}</Text>
        ) : (
          <Text>{`${duration}\nYou booked yourself`}</Text>
        )}
      </TouchableOpacity>
    );
  }

  // shows modal with messages and button when user(washer) wants to cancel the self made booking
  renderCancelWarning = () => {
    const { renderCancelWarning } = this.state;
    return (
      <Modal
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        isVisible={renderCancelWarning}
        coverScreen
        hasBackdrop
        backdropColor="black"
        onBackdropPress={() => this.setState({ renderCancelWarning: false })}
      >
        <View style={{ backgroundColor: "white", width, padding: 40 }}>
          <Text style={styles.modalText}>
            Are you sure you want to delete your own booking?
          </Text>
          <Button
            buttonStyle={styles.button}
            fontSize={moderateScale(18)}
            title="Confirm"
            onPress={() => {
              this.setState({ renderCancelWarning: false });
              this.deleteBooking();
            }}
          />
          <Button
            color="#fff"
            buttonStyle={[styles.button, { marginTop: moderateScale(10) }]}
            fontSize={moderateScale(18)}
            title="Cancel"
            onPress={() => {
              this.setState({ renderCancelWarning: false });
            }}
          />
        </View>
      </Modal>
    );
  };

  // deletes the self made booking from firebase database
  deleteBooking = () => {
    firebase
      .firestore()
      .collection("bookings")
      .doc(this.state.bookingToDelete)
      .delete()
      .then((res) => {
        console.log(res);
        this.setState({
          showConfirmDeleteModal: true,
          bookingToDelete: null,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // library(react-native-calendars) function to render empty date
  renderEmptyDate() {
    return (
      <View style={styles.emptyDate}>
        <Text>This is empty date!</Text>
      </View>
    );
  }

  // library(react-native-calendars) function called when there is changes in calendar row
  rowHasChanged(r1, r2) {
    return r1 !== r2;
  }

  // formats the time
  timeToString(time) {
    const date = new Date(time);
    return date.toISOString().split("T")[0];
  }

  // creates new self booking in firebase database
  makeSelfBooking = () => {
    const { userId, fullName } = this.props.user;
    const { startDate, startDateInMS, endDate, endDateInMS } = this.state;
    console.log(startDate, endDate, startDateInMS, endDateInMS);
    if (startDate === null || endDate === null) {
      return this.setState({ showError: true });
    }
    const startTime = startDate.split("-")[1];
    const endTime = endDate.split("-")[1];
    const bookedHours = [startDateInMS, endDateInMS];
    const requestDetails = {
      washerId: userId,
      ownerName: fullName,
      washerName: fullName,
      status: "accepted",
      date: startDateInMS,
      requestedBooking: false,
      duration: `${startTime} - ${endTime}`,
      bookedHours,
    };
    firebase
      .firestore()
      .collection("bookings")
      .add(requestDetails)
      .then((response) => {
        this.setState({
          renderModal: false,
          endDate: null,
          startDate: null,
          endDate: null,
          endDateInMS: null,
          startDateInMS: null,
          endPicker: false,
          startPicker: false,
          reload: true,
        });
      })
      .catch((err) => console.log(err));
  };

  // formats selected date
  handleDatePicked = (date, check) => {
    const formattedDate = moment(date).format("MMM Do - hh:mm");
    const dateInMS = date.getTime();
    console.log(dateInMS);
    console.log(check);
    if (check) {
      this.setState({
        startDate: formattedDate,
        startDateInMS: date.getTime(),
        startPicker: false,
        endPicker: false,
      });
    } else {
      this.setState({
        endDate: formattedDate,
        endDateInMS: date.getTime(),
        endPicker: false,
        startPicker: false,
      });
    }
  };

  // renders DateTimePicker to select start and end date to make self booking
  renderModalItems = () => {
    const { startPicker, endPicker, startDate, endDate } = this.state;
    return (
      <View>
        <TouchableOpacity
          onPress={() => this.setState({ startPicker: true, endPicker: false })}
          style={styles.whiteBackground}
        >
          <DateTimePicker
            isVisible={startPicker}
            onConfirm={(date) => this.handleDatePicked(date, true)}
            mode="datetime"
            onCancel={() => this.setState({ startPicker: false })}
          />
          <Text style={styles.whiteBackText}>
            {startDate || "Start Date/Time"}
          </Text>
          <Icon
            name="angle-down"
            type="font-awesome"
            color="black"
            containerStyle={{ flex: 1, justifyContent: "center" }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.setState({ endPicker: true, startPicker: false })}
          style={styles.whiteBackground}
        >
          <DateTimePicker
            isVisible={endPicker}
            onConfirm={(date) => this.handleDatePicked(date, false)}
            mode="datetime"
            onCancel={() => this.setState({ endPicker: false })}
          />
          <Text style={styles.whiteBackText}>{endDate || "End Date/Time"}</Text>
          <Icon
            name="angle-down"
            type="font-awesome"
            color="black"
            containerStyle={{ flex: 1, justifyContent: "center" }}
          />
        </TouchableOpacity>
      </View>
    );
  };

  // creates modal to show DateTimePicker and buttons
  renderModal = () => {
    const { renderModal, showError } = this.state;
    return (
      <Modal
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        isVisible={renderModal}
        coverScreen
        hasBackdrop
        backdropColor="black"
        backdropOpacity={0.9}
        onBackdropPress={() =>
          this.setState({
            renderModal: false,
            startPicker: false,
            endPicker: false,
          })
        }
      >
        <Text style={{ color: "white", fontSize: 16 }}>
          Select date to block
        </Text>
        {this.renderModalItems()}
        {showError && (
          <ErrorMessage errorMessage="Please select date" marginTop={10} />
        )}
        <Button
          title="Save"
          buttonStyle={{
            borderRadius: 50,
            height: 50,
            width: "80%",
            marginTop: 20,
            backgroundColor: colors.accent,
          }}
          onPress={() => {
            this.makeSelfBooking();
          }}
        />
      </Modal>
    );
  };

  render() {
    const { loading, items, renderModal, refresh } = this.state;
    const today = moment(new Date()).format("YYYY-MM-DD");
    console.log(loading);
    if (loading) return <LoadScreen text="Loading schedules" />;
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          {renderModal && this.renderModal()}
          {this.renderCancelWarning()}
          <Agenda
            items={items}
            style={{
              flex: 1,
              alignSelf: "stretch",
            }}
            loadItemsForMonth={this.loadItems.bind(this)}
            selected={today}
            renderItem={this.renderItem.bind(this)}
            renderEmptyDate={this.renderEmptyDate.bind(this)}
            rowHasChanged={this.rowHasChanged.bind(this)}
            onRefresh={() => {
              this.setState({ refresh: true });
              this.getBookings();
            }}
            refreshing={refresh}
          />
          <Button
            icon={{ name: "plus", type: "entypo" }}
            containerStyle={{
              position: "absolute",

              bottom: 40,
              right: 40,
            }}
            buttonStyle={{
              borderRadius: 50,
              height: 50,
              width: 50,
              backgroundColor: "transparent",
              alignItems: "center",
              alignContent: "center",
              justifyContent: "center",
            }}
            onPress={() => this.setState({ renderModal: true })}
            raised
          />
        </View>
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

export default connect(mapStateToProps)(Jobs);
