import React from "react";
import { Image, ScrollView, Dimensions, ImageBackground } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { connect } from "react-redux";
import { Text, Button } from "react-native-elements";
import Swiper from "react-native-swiper";
import firebase from "react-native-firebase";

const { width } = Dimensions.get("window");

const description = [
  "Complete your profile information including payment options",
  "Enter your post code, find local cleaners, check availability, request a booking",
  "Once the cleaner accepts your booking you will be sent a confirmation notification through the app and by email",
  "You will be sent a notification when your team are on their way 30 minutes in advanced. Upon arrival you meet your cleaner at your vehicle, inspect the car together before cleaning commences.",
  "Once your car is complete a notification will be sent to your through the app to inspect your cleaners handy work and confirm you are 100% satisfied.",
  "Tell your friends on Facebook how happy you are with your Squeaky clean vehicle.",
  "Enter all of the required information in order for us to check your eligibility",
  "Submit the relevant documents to enable us to confirm your identity",
  "We have created a list of the best equipment available for you to choose from for cleaning vehicles. All of our cleaners are required to wear the Sqweek uniform and this can be purchased directly form us once approved.",
  "Tell people when you are available and what areas you are willing to travel to for cleaning vehicles.",
  "Once you go live on the app just wait for a booking, accept the booking and our app will take care of the rest.",
  "We pay all cleaners 7 days in arrears on a weekly rolling basis. Our working week begins on a Monday and runs to Sunday.",
];

const title = [
  "Complete profile",
  "Find a local squeak team",
  "Your booking gets confirmed",
  "Sqweek Team arrive",
  "They tell you when its done",
  "Rate & Share",
  "Complete your profile",
  "Verify your ID",
  "Order your Kit",
  "Set your schedule",
  "Accept your first job",
  "Get Paid",
];

const pathToAsset = "../../assets/setup/";
const styles = {
  containerStyle: {
    flex: 1,
    paddingTop: 10,
  },
  textStyle: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
  },
  button: {
    borderRadius: moderateScale(5),
    backgroundColor: "black",
    width: width - 40,
    marginTop: 20,
  },
  slideStyle: {
    flex: 1,
    width: 300,
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
};

class Tutorial extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    tutorials: [],
  };

  componentDidMount() {
    const { userType } = this.props.user;
    const tutorials = [
      {
        description: userType ? description[6] : description[0],
        title: userType ? title[6] : title[0],
        image: require(`${pathToAsset}profile.png`),
      },
      {
        description: userType ? description[7] : description[1],
        title: userType ? title[7] : title[1],
        image: userType
          ? require(`${pathToAsset}id.png`)
          : require(`${pathToAsset}location.png`),
      },
      {
        description: userType ? description[8] : description[2],
        title: userType ? title[8] : title[2],
        image: userType
          ? require(`${pathToAsset}kit.png`)
          : require(`${pathToAsset}payment.png`),
      },
      {
        description: userType ? description[9] : description[3],
        title: userType ? title[9] : title[3],
        image: userType
          ? require(`${pathToAsset}schedule.png`)
          : require(`${pathToAsset}friends.png`),
      },
      {
        description: userType ? description[10] : description[4],
        title: userType ? title[10] : title[4],
        image: require(`${pathToAsset}wash.png`),
      },
      {
        description: userType ? description[11] : description[5],
        title: userType ? title[11] : title[5],
        image: userType
          ? require(`${pathToAsset}paid.png`)
          : require(`${pathToAsset}review.png`),
      },
    ];
    this.setState({ tutorials });
  }

  // updates firebase database if the user went through the tutorial
  updateTutorial = () => {
    const { userId } = this.props.user;
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .update({ tutorial: true });
  };

  render() {
    const { tutorials } = this.state;
    const tutorialsList = tutorials.map((value, i) => {
      return (
        <ScrollView contentContainerStyle={styles.slideStyle} key={i}>
          <Image
            resizeMode="contain"
            style={{ width: moderateScale(240), height: moderateScale(240) }}
            source={value.image}
          />
          <Text
            style={[
              styles.textStyle,
              {
                fontSize: 35,
                color: "white",
                fontWeight: "700",
                paddingTop: moderateScale(40),
                paddingBottom: moderateScale(40),
              },
            ]}
          >
            {value.title}
          </Text>
          <Text style={styles.textStyle}>{value.description}</Text>
          {i === tutorials.length - 1 && (
            <Button
              onPress={() => {
                this.updateTutorial();
              }}
              buttonStyle={styles.button}
              underlayColor="#fff"
              title="Finish"
            />
          )}
        </ScrollView>
      );
    });
    return (
      <ImageBackground
        source={require("../../assets/background.png")}
        style={{ width: "100%", height: "100%" }}
      >
        <Swiper
          loop={false}
          // showsButtons // shows side arrows
          dotColor="#696238"
          activeDotColor="#f5cb23"
        >
          {tutorialsList}
        </Swiper>
      </ImageBackground>
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

export default connect(mapStateToProps)(Tutorial);
