// NATIVE FEATURE: Camera (expo-image-picker) + compression (expo-image-manipulator).
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Opens the camera (or the gallery) and returns a compressed JPEG as base64, or null if cancelled.
// Compressed to ~800px wide so it stays far below Firestore's 1 MB document limit.
export async function takeAssignmentPhoto({ fromGallery = false } = {}) {
  const permission = fromGallery
    ? await ImagePicker.requestMediaLibraryPermissionsAsync()
    : await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error(fromGallery ? 'Gallery permission was denied.' : 'Camera permission was denied.');
  }

  const options = { mediaTypes: ['images'], quality: 1, allowsEditing: true };
  const result = fromGallery
    ? await ImagePicker.launchImageLibraryAsync(options)
    : await ImagePicker.launchCameraAsync(options);
  if (result.canceled) return null;

  const asset = result.assets[0];
  const context = ImageManipulator.manipulate(asset.uri);
  if (asset.width > 800) context.resize({ width: 800 });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: 0.5, format: SaveFormat.JPEG, base64: true });

  return { base64: saved.base64, uri: saved.uri };
}
