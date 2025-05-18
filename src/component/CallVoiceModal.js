import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const CallVoiceModal = ({ receiver, callModalVisible, handleCancelCall }) => {
  return (
    <Modal
      visible={callModalVisible}
      transparent
      animationType="fade"
      onRequestClose={handleCancelCall}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.callModalContainer}>
          <Text style={styles.callModalText}>
            Đang gọi {receiver.username}...
          </Text>
          <TouchableOpacity
            style={styles.cancelCallButton}
            onPress={handleCancelCall}
          >
            <Text style={styles.cancelCallButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CallVoiceModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  callModalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    elevation: 10,
  },
  callModalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#007bff",
  },
  cancelCallButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelCallButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
