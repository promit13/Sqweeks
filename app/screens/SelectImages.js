import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import firebase from 'react-native-firebase';
import stripe from 'tipsi-stripe'
import { connect } from 'react-redux';
import RNFS from 'react-native-fs';
import moment from "moment";
import { dirPicutures } from '../utils/DirStorage';
import RenderImages from '../components/RenderImages';

const numColumns = 3;
const size = Dimensions.get('window').width / numColumns;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  imageStyle: {
    height: 100,
    width: 100,
    marginBottom: 10,
  },
  itemContainer: {
    width: size,
    height: size,
  },
  item: {
    flex: 1,
    margin: 3,
    backgroundColor: 'lightblue',
  },
  capture: {
    marginBottom: 50,
  }
});

let imagesName = [];

class SelectImages extends React.Component {

  state = {
    images: {},
    image: { path: 'https://facebook.github.io/react-native/docs/assets/favicon.png' },
    cardDetail: {},
    loading: true,
  }

  // STRIPE
  // componentDidMount() {
  //   stripe.setOptions({
  //     publishableKey: 'pk_test_M4kMiU82SrweHoP8j7jHJ9TK00VtXX5nqq',
  //     merchantId: 'merchant.com.tickle.sqweeks', // Optional
  //     // androidPayMode: 'test', // Android only
  //   });
  //   const { user } = this.props.navigation.state.params;
  //   console.log(user.uid);
  //   firebase.firestore()
  //   .collection("users")
  //   .doc(user.uid)
  //   .onSnapshot((response) => {
  //     const currentUser = response.data();
  //     console.log(currentUser.cardDetail);
  //     this.setState({
  //       cardDetail: currentUser.cardDetail,
  //     });
  //   });
  // }

  componentDidMount = () => {
    const { userId } = this.props.user;
    firebase.firestore()
    .collection("images")
    .doc(userId)
    .get()
    .then((response) => {
      const { images } = response.data();
      console.log(images);
      if (images === undefined) {
        return this.setState({ loading: false });
      }
      this.setState({ images, loading: false });
    });
  }

  updateUserImagesArray = () => {
    const { images } = this.state;
    const imageArray = Object.entries(images).map(([key, value], index) => {
      return value;
    });
    const { userId } = this.props.user;
    console.log(imageArray.length);
    const totalImages = imageArray.length === 0 ? imagesName : imagesName.concat(imageArray[0]);
    console.log(totalImages);
    firebase.firestore()
    .collection("images")
    .doc(userId)
    .set({ images: totalImages })
    .then(() => {
      this.setState({ loading: false });
      console.log('file successfully uploaded');
      imagesName = [];
    })
  }

  uploadImage = (images, index) => {
    const { userId } = this.props.user;
    const { filename, sourceURL, path } = images[index];
    firebase.storage().ref()
      .child(`${userId}/${filename}`)
      .put(path)
      .then((response) => {
        const { downloadURL } = response;
        console.log(downloadURL);
        imagesName.push(downloadURL);
        if (index === (images.length - 1)) {
          this.updateUserImagesArray();
          return;
        }
        // this.saveImage(path);
        this.uploadImage(images, index + 1);
      })
      .catch(err => console.log(err));
  }

  pickImage = () => {
    ImagePicker.openPicker({
      multiple: true
    }).then(images => {
      this.setState({ loading: true });
      console.log('SELECTED IMAGES', images);
      this.uploadImage(images, 0);
    });
  }

  openCamera = async () => {
    const { userId } = this.props.user;
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      // this.setState({ image });
      console.log('IMAGE', image);
      // console.log('filename', image.filename);
      // this.saveImage(image.path);
      // const array = image.path.split("/");
      // const filename = array[array.length - 1];
      // console.log(array[array.length - 1]);
      const newImageName = `${moment().format('DDMMYY_HHmmSSS')}.jpg`;
      firebase.storage().ref()
      .child(`${userId}/${newImageName}`)
      .put(image.path)
      .then((response) => {
        const { downloadURL } = response;
        console.log(downloadURL);
        imagesName.push(downloadURL);
          this.updateUserImagesArray();
        // this.saveImage(path);
      })
      .catch(err => console.log(err));
    });
  }

  grid = () => {
    const { images } = this.state;
    // const imageArray = Object.values(images);
    console.log(images);
    return (
      <FlatList
        data={images}
        renderItem={({item}) => (
          <View style={styles.itemContainer}>
            <Image resizeMode="contain" style={styles.imageStyle} source={{ uri: item }} />
          </View>
        )}
        numColumns={numColumns} />
    );
  }

  render() {
    const { image, cardDetail, loading, images } = this.state;
    const imageArray = Object.entries(images).map(([key, value], index) => {
      return value;
    });
    console.log(imageArray);
    // const {
    //   cardNumber,
    //   cvc,
    //   expiryDate
    //  } = cardDetail;
    //  if(expiryDate !== undefined) {
    //   const cardDate = expiryDate.split('/');
    //   const cardToPay = {
    //     number: cardNumber,
    //     cvc,
    //     expYear: parseInt(cardDate[1]),
    //     expMonth: parseInt(cardDate[0])
    //   }
    //   stripe.createTokenWithCard(cardToPay)
    //     .then(token => console.log(token))
    //     .catch(error => console.log(error));
    //   console.log(cardToPay);
    //  }
    return (
      <View style={styles.container}>
        <Image resizeMode="contain" style={styles.imageStyle} source={{ uri: image.path  }} />
        {/* {this.grid()} */}
        <RenderImages images={imageArray[0]}/>
        {loading ? <ActivityIndicator /> : null}
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => this.openCamera()} style={styles.capture}>
            <Text style={{ fontSize: 14 }}> SNAP </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.pickImage()} style={styles.capture}>
            <Text style={{ fontSize: 14 }}> Choose </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({ checkUser }) => {
  const { user } = checkUser;
  console.log('MAP RED', user);
  return {
    user
  };
};

export default connect(mapStateToProps)(SelectImages);