import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography } from '../theme/colors';

export default function ScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraMode, setCameraMode] = useState(false);
  const cameraRef = useRef(null);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const openCamera = () => {
    if (hasPermission) {
      setCameraMode(true);
    } else {
      alert('Camera permission is required to use this feature.');
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
        setCameraMode(false);
        navigation.navigate('Details', { imageUri: photo.uri, imageBase64: photo.base64 });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      navigation.navigate('Details', { imageUri: asset.uri, imageBase64: asset.base64 });
    }
  };

  if (cameraMode) {
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing="back" ref={cameraRef}>
          <View style={styles.overlay}>
            <View style={styles.frameLine} />
          </View>
          <View style={styles.cameraControlsContainer}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setCameraMode(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Prescription Scanner</Text>
        <Text style={styles.subtitle}>Choose an option to begin</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.primaryButton} onPress={openCamera}>
            <Text style={styles.buttonText}>Open Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
            <Text style={styles.secondaryButtonText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    ...typography.header,
    marginBottom: 5,
  },
  subtitle: {
    ...typography.body,
    marginBottom: 40,
    color: colors.textSecondary,
  },
  optionsContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonText: {
    ...typography.button,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameLine: {
    width: 250,
    height: 350,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  cameraControlsContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'black',
  },
  cancelButton: {
    padding: 10,
  }
});
