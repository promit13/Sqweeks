import React from "react";
import { Image } from "react-native";
import {
  createAppContainer,
  createStackNavigator,
  createDrawerNavigator,
} from "react-navigation";
import { Icon } from "react-native-elements";
import colors from "./style";
import Profile from "./screens/Profile";
import WasherBookingsList from "./screens/WasherBookingsList";
import Reviews from "./screens/Reviews";
import Jobs from "./screens/Jobs";
import Map from "./screens/Map";
import Tutorial from "./screens/Tutorial";
import Login from "./screens/Login";
import ForgotPassword from "./screens/ForgotPassword";
import AuthLoadingScreen from "./screens/AuthLoadingScreen";
import TermsAndConditions from "./screens/TermsAndConditions";
import Chat from "./screens/Chat";
import OwnerBookingsList from "./screens/OwnerBookingsList";
import OwnerBookingDetails from "./screens/OwnerBookingDetails";
import WasherBookingDetails from "./screens/WasherBookingDetails";
import EditProfile from "./screens/EditProfile";
import RegisterProfile from "./screens/RegisterProfile";
import RegisterLocation from "./screens/RegisterLocation";
import RegisterPaymentCard from "./screens/RegisterPaymentCard";
import RegisterCrbCheck from "./screens/RegisterCrbCheck";
import RegisterWorkingHours from "./screens/RegisterWorkingHours";
import ApprovalMessageScreen from "./screens/ApprovalMessageScreen";
import TipAndRate from "./screens/TipAndRate";
import LogoutClass from "./screens/LogoutClass";
import FinishJob from "./screens/FinishJob";

const MapStack = createStackNavigator({
  Map,
  Profile,
  Chat,
  Reviews,
});

const OwnerBookingStack = createStackNavigator({
  OwnerBookingsList,
  OwnerBookingDetails,
  Chat,
  FinishJob,
  TipAndRate,
});

const WasherBookingStack = createStackNavigator({
  WasherBookingsList,
  WasherBookingDetails,
  FinishJob,
  Chat,
});

export const OwnerSignedIn = createDrawerNavigator(
  {
    Map: MapStack,
    Bookings: OwnerBookingStack,
    Settings: EditProfile,
    Logout: LogoutClass,
  },
  {
    drawerBackgroundColor: colors.accent,
    drawerPosition: "left",
    drawerWidth: 200,
    contentOptions: {
      activeTintColor: "black",
      activeBackgroundColor: colors.accent,
      inactiveTintColor: "white",
    },
    navigationOptions: ({ navigation }) => ({
      headerTitle: (
        <Image
          source={require("../assets/logo-text.png")}
          style={{ width: 150 }}
          resizeMode="contain"
        />
      ),
      headerLeft: (
        <Icon
          onPress={navigation.toggleDrawer}
          name="menu"
          color="#fff"
          iconStyle={{ marginLeft: 10 }}
          size={30}
          underlayColor="fff"
        />
      ),
      headerStyle: {
        backgroundColor: "#F8B40A",
        marginTop: 20,
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
        textAlign: "center",
      },
      gestureEnabled: true,
    }),
  }
);

const WasherSignedIn = createDrawerNavigator(
  {
    Profile,
    Bookings: WasherBookingStack,
    Calendar: Jobs,
    Reviews,
    Settings: EditProfile,
    Logout: LogoutClass,
  },
  {
    drawerBackgroundColor: colors.accent,
    drawerPosition: "left",
    drawerWidth: 200,
    contentOptions: {
      activeTintColor: "black",
      activeBackgroundColor: colors.accent,
      inactiveTintColor: "white",
    },
    navigationOptions: ({ navigation }) => ({
      headerTitle: (
        <Image
          source={require("../assets/logo-text.png")}
          style={{ width: 150 }}
          resizeMode="contain"
        />
      ),
      headerLeft: (
        <Icon
          onPress={navigation.toggleDrawer}
          name="menu"
          color="#fff"
          iconStyle={{ marginLeft: 10 }}
          size={30}
          underlayColor="fff"
        />
      ),
      headerStyle: {
        backgroundColor: "#F8B40A",
        marginTop: 20,
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
        textAlign: "center",
      },
      gestureEnabled: true,
      gestureDirection: "horizontal",
    }),
  }
);

const SignedOut = createStackNavigator(
  {
    Login: { screen: Login },
    ForgotPassword: { screen: ForgotPassword },
    RegisterProfile: { screen: RegisterProfile },
  },
  {
    navigationOptions: {
      header: null,
    },
  }
);

const LocationRegistration = createStackNavigator(
  {
    RegisterLocation: { screen: RegisterLocation },
  },
  {
    navigationOptions: {
      header: null,
    },
  }
);

const CardRegistration = createStackNavigator(
  {
    RegisterPaymentCard: { screen: RegisterPaymentCard },
  },
  {
    navigationOptions: {
      header: null,
    },
  }
);

const CrbRegistration = createStackNavigator(
  {
    RegisterCrbCheck: { screen: RegisterCrbCheck },
  },
  {
    navigationOptions: {
      header: null,
    },
  }
);

const WorkingHourRegistration = createStackNavigator(
  {
    RegisterWorkingHours: { screen: RegisterWorkingHours },
  },
  {
    navigationOptions: {
      header: null,
    },
  }
);

const ApprovalScreen = createStackNavigator(
  {
    ApprovalMessageScreen: { screen: ApprovalMessageScreen },
  },
  {
    navigationOptions: {
      header: null,
    },
  }
);

const TutorialDisplay = createStackNavigator(
  {
    Tutorial: { screen: Tutorial },
  },
  {
    navigationOptions: {
      header: null,
    },
  }
);

const Terms = createStackNavigator(
  {
    TermsAndConditions: { screen: TermsAndConditions },
  },
  {
    navigationOptions: {
      header: null,
    },
  }
);

const MainStackNavigator = createStackNavigator(
  {
    SignedOut,
    OwnerSignedIn,
    WasherSignedIn,
    TutorialDisplay,
    AuthLoadingScreen,
    LocationRegistration,
    CardRegistration,
    Terms,
    CrbRegistration,
    WorkingHourRegistration,
    ApprovalScreen,
  },
  {
    initialRouteName: "AuthLoadingScreen",
    // headerMode: 'none'
  }
);

export default createAppContainer(MainStackNavigator);
