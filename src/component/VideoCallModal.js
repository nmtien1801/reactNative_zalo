import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  Platform,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
// import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

const VideoCallModal = ({ show, onHide, socketRef }) => {
  const [jitsiUrl, setJitsiUrl] = useState(null);

  // action socket
  useEffect(() => {
    socketRef.current.on("RES_CALL", (from, to) => {
      const members = to.members || [];
      const membersString = members.join("-");
      setJitsiUrl(`https://meet.jit.si/${membersString}`);
      console.log("from ", from, "to ", to);
    });
  }, []);

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
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture"
            style={{ width: "100%", height: "100%", border: "none" }}
            sandbox="allow-scripts allow-same-origin allow-forms" // Cho phép các quyền iframe cụ thể
          />

          {/* {Platform.OS === "web" ? (
            <iframe
              src={jitsiUrl}
              allow="camera; microphone; fullscreen; display-capture"
              style={{ width: "100%", height: "100%", border: "none" }}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          ) : (
            <WebView
              originWhitelist={["*"]}
              javaScriptEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              allowUniversalAccessFromFileURLs={true}
              source={{
                html: `
                <html>
                  <body style="margin:0;padding:0;">
                    <iframe 
                      src="${jitsiUrl}"
                      style="width:100%; height:100%; border:none;"
                      allow="camera; microphone; fullscreen; display-capture"
                    ></iframe>
                  </body>
                </html>`,
              }}
              style={styles.webView}
            />
          )} */}
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
  webView: {
    flex: 1,
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
});

export default VideoCallModal;
