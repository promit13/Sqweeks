import React from "react";
import { View, Dimensions, ActivityIndicator, ScrollView } from "react-native";
import { Text, Button } from "react-native-elements";
import firebase from "react-native-firebase";
import { connect } from "react-redux";
import colors from "../style";
import ErrorMessage from "../components/Error";

const { width } = Dimensions.get("window");

const styles = {
  mainContainer: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingTop: 40,
  },
  buttonStyle: {
    backgroundColor: "black",
    marginTop: 10,
    borderRadius: 20,
    width: width - 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.43,
    shadowRadius: 9.51,
    elevation: 15,
  },
};

class TermsAndConditions extends React.Component {
  static navigationOptions = {
    header: null,
  };

  state = {
    errorMessage: "",
    errorMessageVisible: false,
    loading: false,
  };

  // updates firebase database if the user accepts the terms and conditions
  handleSave = () => {
    const { userId } = this.props.user;
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .update({ agreementAccepted: true })
      .then(() => {
        this.setState({
          loading: false,
          errorMessage: "",
          errorMessageVisible: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          errorMessage: "Somehting went wrong!",
          errorMessageVisible: true,
        });
        console.log(err);
      });
  };

  render() {
    const { errorMessageVisible, errorMessage, loading } = this.state;
    return (
      <View style={styles.mainContainer}>
        <ScrollView>
          <View style={{ backgroundColor: "white", padding: 40 }}>
            <Text style={{ padding: 10, fontSize: 16, marginTop: 20 }}>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
              aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
              sed quia non numquam eius modi tempora incidunt ut labore et
              dolore magnam aliquam quaerat voluptatem. Ut enim ad minima
              veniam, quis nostrum exercitationem ullam corporis suscipit
              laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem
              vel eum iure reprehenderit qui in ea voluptate velit esse quam
              nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo
              voluptas nulla pariatur?" "Sed ut perspiciatis unde omnis iste
              natus error sit voluptatem accusantium doloremque laudantium,
              totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
              quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
              ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
              sed quia consequuntur magni dolores eos qui ratione voluptatem
              sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia
              dolor sit amet, consectetur, adipisci velit, sed quia non numquam
              eius modi tempora incidunt ut labore et dolore magnam aliquam
              quaerat voluptatem. Ut enim ad minima veniam, quis nostrum
              exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid
              ex ea commodi consequatur? Quis autem vel eum iure reprehenderit
              qui in ea voluptate velit esse quam nihil molestiae consequatur,
              vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
            </Text>
          </View>
          {loading && <ActivityIndicator />}
          <View
            style={{
              backgroundColor: colors.accet,
              alignItems: "center",
            }}
          >
            {errorMessageVisible && (
              <ErrorMessage errorMessage={errorMessage} />
            )}
            <Button
              buttonStyle={styles.buttonStyle}
              fontSize={16}
              title="Accept"
              onPress={async () => {
                this.setState({ loading: true });
                this.handleSave();
              }}
            />
            <Button
              buttonStyle={[
                styles.buttonStyle,
                { backgroundColor: "white", marginBottom: 30 },
              ]}
              fontSize={16}
              titleStyle={{ color: "black" }}
              title="Decline"
              onPress={() => {
                this.setState({
                  errorMessage: "You need to accept the agreement to continue",
                  errorMessageVisible: true,
                });
              }}
            />
          </View>
        </ScrollView>
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

export default connect(mapStateToProps)(TermsAndConditions);
