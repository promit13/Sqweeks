import React from "react";
import { GiftedChat } from "react-native-gifted-chat";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import axios from "axios";
import colors from "../style";
import { SendMessageUrl } from "../config";

class Chat extends React.Component {
  static navigationOptions = {
    title: "Chat",
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
    messages: [],
    received: false,
    messageDocId: "",
    receiverId: "",
    messagingToken: "",
  };

  componentDidMount() {
    const { receiverId, bookingId } = this.props.navigation.state.params;
    firebase
      .firestore()
      .collection("users")
      .doc(receiverId)
      .get()
      .then((user) => {
        const { messagingToken } = user.data();
        this.setState({ messagingToken, messageDocId: bookingId, receiverId });
      })
      .catch((err) => console.log(err));

    firebase
      .firestore()
      .collection("messages")
      .doc(bookingId)
      .onSnapshot((response) => {
        const data = response.data();
        if (data !== undefined) {
          const messageArray = Object.values(data);
          console.log("MARRAY", messageArray);
          this.setState({
            messages: messageArray,
          });
        }
      });
  }

  // updates message on firebase database
  // and sends  message notification to the other end
  onSend(messages = []) {
    const { text, user } = messages[0];
    const { name, _id } = user;
    const { messageDocId, messagingToken, receiverId } = this.state;
    const sentMessages = [
      {
        ...messages[0],
        sent: true,
        received: true,
        createdAt: new Date().getTime(),
      },
    ];
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, sentMessages),
      }),
      () => {
        firebase
          .firestore()
          .collection("messages")
          .doc(messageDocId)
          .set(this.state.messages);
        axios
          .post(SendMessageUrl, {
            senderName: name,
            messagingToken,
            message: text,
            senderId: _id,
            receiverId,
          })
          .then((response) => console.log(response))
          .catch((err) => console.log(err));
      }
    );
  }

  render() {
    const { email, fullName, userId } = this.props.user;
    const user = {
      name: fullName,
      email,
      _id: userId,
    };
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={(messages) => this.onSend(messages)}
        user={user}
      />
    );
  }
}

const mapStateToProps = ({ checkUser }) => {
  const { user } = checkUser;
  return {
    user,
  };
};

export default connect(mapStateToProps)(Chat);
