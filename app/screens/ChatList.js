import React, { Component } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import firebase from 'react-native-firebase';
import { async } from 'rxjs/internal/scheduler/async';

class ChatList extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      header: null,
    };
  };

  state = {
    bookingArray: [],
  }

  componentDidMount() {
    const { userId } = this.props.user;
    let bookingArray = [];
    firebase.firestore()
    .collection("bookings")
    .where("ownerId", "==", userId)
    .get()
    .then(async(querySnapshot) => {
        await querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            bookingArray.push(doc.data());
        });
        console.log(bookingArray);
        this.setState({ bookingArray });

    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
  }

  renderBookingDetail = () => {
    const { bookingArray } = this.state;
    const bookingList = bookingArray.map((item, index) => {
      const { carSize, date, location, price } = item;
      return (
        <TouchableOpacity onPress={() => this}>
        <View style={{ backgroundColor: 'yellow', borderWidth: 1, borderColor: 'black' }}>
          <Text>
            {date}
          </Text>
          <Text>
            {carSize}
          </Text>
          <Text>
            {location}
          </Text>
          <Text>
            {price}
          </Text>
        </View>
        </TouchableOpacity>
      );
    })
    return bookingList;
  }

  render() {
    return (
      <ScrollView>
        {this.renderBookingDetail()}
      </ScrollView>
    )
  }
}

const mapStateToProps = ({ checkUser }) => {
  const { user } = checkUser;
  console.log('ChatlIST', user);
  return {
    user
  };
};

export default connect(mapStateToProps)(ChatList);

