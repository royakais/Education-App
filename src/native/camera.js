// NATIVE FEATURE: Camera (expo-image-picker) + compression (expo-image-manipulator).
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Shrinks a photo to ~720px wide JPEG and returns it as base64 (≈60–120 KB each),
// so several photos still fit in one Firestore document (1 MB max).
async function compress(asset) {
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > 720) context.resize({ width: 720 });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: 0.45, format: SaveFormat.JPEG, base64: true });
  return saved.base64;
}

// Camera: takes ONE photo. Returns [base64] or [] if cancelled.
export async function takePhoto() {
  const { granted } = await ImagePicker.requestCameraPermissionsAsync();
  if (!granted) throw new Error('Camera permission was denied.');
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
  if (result.canceled) return [];
  return [await compress(result.assets[0])];
}

// Gallery: picks SEVERAL photos at once (up to `limit`). Returns an array of base64.
export async function pickPhotos(limit) {
  const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!granted) throw new Error('Gallery permission was denied.');
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 1,
  });
  if (result.canceled) return [];
  return Promise.all(result.assets.slice(0, limit).map(compress));
}
