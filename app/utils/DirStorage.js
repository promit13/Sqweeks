import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export const dirHome = Platform.select({
  ios: `${RNFS.DocumentDirectoryPath}/sqweek`,
  android: `${RNFS.ExternalStorageDirectoryPath}/sqweek`
});

export const dirPicutures = `${dirHome}/Pictures`;