import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  CameraRoll } from 'react-native';
import Permissions from 'react-native-permissions';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-crop-picker';
import firebase from 'react-native-firebase';
// OR const Permissions = require('react-native-permissions').default
// if you use CommonJS module system

// …

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});


export default class CameraClass extends React.Component {
  state = {
      cameraPermission: false,
      photoPermission: false,
      cardDetail: {},
  }

  // Check the status of a single permission
  componentDidMount() {
    this._checkCameraAndPhotos();
  }

  // Request permission to access photos
  _requestPermission = (type) => {
    Permissions.request(type).then(response => {
      console.log('REQ PER', response);
      // Returns once the user has chosen to 'allow' or to 'not allow' access
      // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
      type === 'camera' ? this.setState({ cameraPermission: response }) : this.setState({ photoPermission: response });
    });
  };

  // Check the status of multiple permissions
  _checkCameraAndPhotos = () => {
    Permissions.checkMultiple(['camera', 'photo']).then(response => {
      const { camera, photo } = response;
      //response is an object mapping type to permission
      if(camera !== 'authorized') {
        this._requestPermission('photo');
      }
      if(photo !== 'authorized') {
        this._requestPermission('camera');
      }
      if (camera === 'authorized' && photo === 'authorized') {
        this.setState({ photoPermission: true, cameraPermission: true });
      }
    });
  };

  // This is a common pattern when asking for permissions.
  // iOS only gives you once chance to show the permission dialog,
  // after which the user needs to manually enable them from settings.
  // The idea here is to explain why we need access and determine if
  // the user will say no, so that we don't blow our one chance.
  // If the user already denied access, we can ask them to enable it from settings.
  _alertForPhotosPermission() {
    Alert.alert(
      'Can we access your photos?',
      'We need access so you can set your profile pic',
      [
        {
          text: 'No way',
          onPress: () => console.log('Permission denied'),
          style: 'cancel',
        },
        this.state.photoPermission == 'undetermined'
          ? {text: 'OK', onPress: this._requestPermission}
          : {text: 'Open Settings', onPress: Permissions.openSettings},
      ],
    );
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      console.log('IMAGE URI', data.uri);
      await CameraRoll.saveToCameraRoll(data.uri, "photo");
    }
  };

  pickImage = async () => {
    ImagePicker.openPicker({
      multiple: true
    }).then(images => {
      console.log(images);
    });
  }

  render() {
    const { cameraPermission, photoPermission } = this.state;
    return (
      <View style={styles.container}>
        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.on}
        />
        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => this.pickImage()} style={styles.capture}>
            <Text style={{ fontSize: 14 }}> SNAP </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}