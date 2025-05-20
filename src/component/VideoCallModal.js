import React, { useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const VideoCallModal = ({ show, onHide, jitsiUrl }) => {
  useEffect(() => {
    if (show && Platform.OS !== "web" && jitsiUrl) {
      // Mở bằng trình duyệt ngoài (tránh redirect qua app)
      const fullUrl = `${jitsiUrl}#config.disableDeepLinking=true`;
      Linking.openURL(fullUrl).catch((err) =>
        console.error("Lỗi mở Jitsi:", err)
      );
    }
  }, [show, jitsiUrl]);

  return (
    <Modal
      visible={show}
      animationType="slide"
      transparent
      onRequestClose={onHide}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onHide}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {Platform.OS === "web" ? (
            <iframe
              src={jitsiUrl}
              allow="camera; microphone; fullscreen; display-capture; screen-wake-lock"
              style={{ width: "100%", height: "100%", border: "none" }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation allow-popups" // Cho phép các quyền iframe cụ thể
            />
          ) : (
            <Text style={styles.infoText}>
              Cuộc gọi đang mở bằng trình duyệt...
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "95%",
    height: "85%",
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 40,
    textAlign: "center",
  },
});

export default VideoCallModal;
