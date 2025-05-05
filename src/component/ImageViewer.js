import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function ImageViewer({ imageUrl, onClose }) {
  console.log("Image URL: ", imageUrl); // Debugging line to check the image URL

  return (
    <TouchableOpacity
      style={styles.overlay}
      onPress={onClose}
      activeOpacity={1} // Set to 1 to disable the opacity change on press
    >
      <Image
        source={{ uri: imageUrl.trim() }}
        resizeMode="contain"
        style={styles.image}
        onError={(e) => console.log('Image failed to load', e.nativeEvent.error)}  // Logging image load errors
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  image: {
    width: "90%",  // Max width set to 90% of the screen width
    height: "90%", // Max height set to 90% of the screen height
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
