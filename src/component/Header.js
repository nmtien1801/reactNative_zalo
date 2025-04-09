import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = height * 0.08;

export default function SearchHeader({ option }) {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const slideAnim = useRef(new Animated.Value(-300)).current;

  const toggleModal = () => {
    if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    } else {
      setModalVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#007bff",
        height: HEADER_HEIGHT,
        paddingHorizontal: 15,
      }}
    >
      <TouchableOpacity>
        <Image
          source={require("../../assets/search.png")}
          style={{ marginRight: 10 }}
        />
      </TouchableOpacity>

      <TextInput
        placeholder="Tìm kiếm"
        placeholderTextColor="#ccc"
        style={{
          flex: 1,
          paddingHorizontal: 15,
          height: HEADER_HEIGHT * 0.6,
          fontSize: 15,
        }}
        onPress={() => navigation.navigate("SearchScreen")}
      />

      {option === "person" && (
        <TouchableOpacity onPress={toggleModal}>
          <Ionicons
            name="settings-outline"
            size={24}
            color="black"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      )}

      <Modal transparent={true} visible={modalVisible} onRequestClose={toggleModal}>
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: darkMode ? "#333" : "#fff",
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: darkMode ? "#fff" : "#000" }]}>
              Settings
            </Text>
            <View style={styles.optionsContainer}>
              <TouchableOpacity onPress={()=>{toggleModal(); navigation.navigate("ChangePassword")}}>
                <Text style={[styles.optionText, { color: darkMode ? "#fff" : "#000" }]}>
                  Change password
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleModal}>
                <Text style={[styles.optionText, { color: darkMode ? "#fff" : "#000" }]}>
                  Change avatar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleModal}>
                <Text style={[styles.optionText, { color: darkMode ? "#fff" : "#000" }]}>
                  Log out
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={toggleModal} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: darkMode ? "#333" : "red" }]}>
                Close
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 20,
    width: "70%",
    height: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  optionsContainer: {},
  optionText: {
    fontSize: 18,
    paddingVertical: 10,
    marginLeft: 10,
    fontWeight: "bold",
  },
  dropdownContent: {
    paddingLeft: 20,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    marginTop: "auto",
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  closeText: {
    fontSize: 18,
  },
});