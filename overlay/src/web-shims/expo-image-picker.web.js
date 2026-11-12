// expo-image-picker on web.
//
// Callers destructure `{ canceled, assets }` immediately, so a generic stub that
// returns another stub breaks the branch. There is no picker UI in a browser
// build, so every launch reports "user canceled" and permissions are granted
// (they are implicit in the browser and the code paths only gate on them).
'use strict';

const { createStub } = require('./native-stub');

const canceled = { canceled: true, assets: null };
const granted = { status: 'granted', granted: true, canAskAgain: true, expires: 'never' };

const base = {
  launchImageLibraryAsync: async () => canceled,
  launchCameraAsync: async () => canceled,
  requestMediaLibraryPermissionsAsync: async () => granted,
  requestCameraPermissionsAsync: async () => granted,
  getMediaLibraryPermissionsAsync: async () => granted,
  getCameraPermissionsAsync: async () => granted,
  MediaTypeOptions: { All: 'All', Images: 'Images', Videos: 'Videos', LivePhotos: 'LivePhotos' },
  MediaType: { Images: 'images', Videos: 'videos', LivePhotos: 'livePhotos' },
  UIImagePickerPreferredAssetRepresentationMode: {
    Automatic: 'automatic',
    Compatible: 'compatible',
    Current: 'current',
  },
  UIImagePickerControllerQualityType: { High: 0, Medium: 1, Low: 2 },
};

const shim = createStub('expo-image-picker', base);

module.exports = shim;
module.exports.default = shim;
