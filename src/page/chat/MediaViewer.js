import React from "react";
import { View, Image, StyleSheet } from "react-native";
import { Video } from "expo-av";

const MediaViewer = ({ route }) => {
  const { media } = route.params;

  return (
    <View style={styles.container}>
      {media.type === "image" ? (
        <Image source={{ uri: media.msg }} style={styles.media} />
      ) : (
        <Video
          source={{ uri: media.msg }}
          style={styles.media}
          resizeMode="contain"
          useNativeControls
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: "100%",
    height: "100%",
  },
});

export default MediaViewer;