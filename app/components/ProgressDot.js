import React from "react";
import StepIndicator from "react-native-step-indicator";
import { moderateScale } from "react-native-size-matters";

const customStyles = {
  stepIndicatorSize: moderateScale(40, 0.1),
  currentStepIndicatorSize: 50,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: "black",
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: "black",
  stepStrokeUnFinishedColor: "#ffffff",
  separatorFinishedColor: "#ffffff",
  separatorUnFinishedColor: "#ffffff",
  stepIndicatorFinishedColor: "black",
  stepIndicatorUnFinishedColor: "#ffffff",
  stepIndicatorCurrentColor: "black",
  stepIndicatorLabelFontSize: 0,
  currentStepIndicatorLabelFontSize: 0,
  stepIndicatorLabelCurrentColor: "transparent",
  stepIndicatorLabelFinishedColor: "transparent",
  stepIndicatorLabelUnFinishedColor: "transparent",
  labelColor: "#999999",
  labelSize: 13,
  labelFontFamily: "OpenSans-Italic",
  currentStepLabelColor: "#7eaec4",
};

// renders progress dot on registration process
export default ProgressDot = ({ index, userType }) => {
  console.log(userType);
  return (
    <StepIndicator
      customStyles={customStyles}
      currentPosition={index}
      stepCount={userType ? 5 : 3}
    />
  );
};
