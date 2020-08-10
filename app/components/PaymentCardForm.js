import React, { Component } from "react";
import { View } from "react-native";
import { Icon } from "react-native-elements";
import { PaymentCardTextField } from "tipsi-stripe";
import colors from "../style";

const styles = {
  inputStyle: {
    height: 70,
    backgroundColor: "white",
    paddingHorizontal: 10,
    marginTop: 1,
    fontSize: 20
  },
  circleBackground: {
    alignSelf: "center",
    width: 44,
    height: 44,
    borderRadius: 44 / 2,
    justifyContent: "center",
    marginBottom: 15
  }
};
export default class PaymentCardForm extends Component {
  state = {
    params: {},
    valid: false
  };

  handleFieldParamsChange = (valid, params) => {
    console.log(`
        Valid: ${valid}
        Number: ${params.number || "-"}
        Month: ${params.expMonth || "-"}
        Year: ${params.expYear || "-"}
        CVC: ${params.cvc || "-"}
      `);
    if (valid) {
      this.props.cardDetails({ params, valid });
    }
  };

  isPaymentCardTextFieldFocused = () => this.paymentCardInput.isFocused();

  focusPaymentCardTextField = () => this.paymentCardInput.focus();

  blurPaymentCardTextField = () => this.paymentCardInput.blur();

  resetPaymentCardTextField = () => this.paymentCardInput.setParams({});

  render() {
    return (
      <PaymentCardTextField
        ref={ref => {
          this.paymentCardInput = ref;
        }}
        style={styles.inputStyle}
        cursorColor={colors.accent}
        textErrorColor="red"
        placeholderColor=""
        numberPlaceholder="Card number"
        expirationPlaceholder="MM-YY"
        cvcPlaceholder="CVV"
        disabled={false}
        onParamsChange={this.handleFieldParamsChange}
      />
    );
  }
}
