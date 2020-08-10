import React from "react";
import Modal from "react-native-modal";
import { Text, View, TouchableOpacity } from "react-native";
import colors from "../style";

// renders modal with different messages and buttons based on props provided
export default ShowModal = ({ showModal, onPress, modalText }) => {
  console.log(modalText);
  return (
    <Modal
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      isVisible={showModal}
      coverScreen
      hasBackdrop
      backdropColor="black"
      backdropOpacity={0.9}
      onBackdropPress={onPress}
    >
      <TouchableOpacity
        style={{
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onPress}
      >
        <View
          style={{
            backgroundColor: colors.accent,
          }}
        >
          <Text
            style={{
              margin: 20,
              fontSize: 20,
              fontWeight: "700",
              color: "white",
              textAlign: "center",
              alignContent: "center",
              alignSelf: "center",
              padding: 10,
            }}
          >
            {modalText}
          </Text>
        </View>
        <Text
          style={{
            margin: 20,
            fontSize: 18,
            color: "black",
          }}
        >
          Ok
        </Text>
      </TouchableOpacity>
    </Modal>
  );
};
