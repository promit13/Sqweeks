import React from 'react';
import { FlatList, Text, Image, Dimensions, View } from 'react-native';

const numColumns = 3;
const size = Dimensions.get('window').width / numColumns;

const styles = {
  textStyle: {
    color: 'red',
    marginLeft: 40,
    fontSize: 10,
  },
  itemContainer: {
    width: size,
    height: size,
  },
  imageStyle: {
    height: 100,
    width: size,
    marginBottom: 10,
  },
};

showModal = () => {
  const { imageUrl, modalVisible } = this.state;
  return (
    <Modal
      style={{ justifyContent: "center", alignItems: "center" }}
      isVisible={modalVisible}
      coverScreen
      hasBackdrop
      backdropColor="black"
      backdropOpacity={0.9}
      onBackdropPress={() => this.setState({ modalVisible: false })}
    >
      <Image
        style={{
          width: width,
          height: 200,
          marginRight: 10
        }}
        source={{
          uri: imageUrl
        }}
      />
    </Modal>
  );
};

export default RenderImages = ({ images }) => {
  console.log('RENDER IMAGES', images);
  return (
    <View>
      <FlatList
        data={images}
        renderItem={({item}) => (
          <View style={styles.itemContainer}>
            <Image resizeMethod="scale" resizeMode="contain" style={styles.imageStyle} source={{ uri: item }} />
          </View>
        )}
        numColumns={3} />
      </View>
    );
};