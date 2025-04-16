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
<<<<<<< HEAD
import { Ionicons } from "@expo/vector-icons";
=======
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
>>>>>>> efd88a4c37eb2a37cfec15487b23592e41a68cd4
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = height * 0.08;

export default function SearchHeader({ option }) {
  const navigation = useNavigation();
<<<<<<< HEAD
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
=======
>>>>>>> efd88a4c37eb2a37cfec15487b23592e41a68cd4

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
<<<<<<< HEAD
        <TouchableOpacity onPress={toggleModal}>
=======
        <TouchableOpacity onPress={()=>navigation.navigate("Setting")}>
>>>>>>> efd88a4c37eb2a37cfec15487b23592e41a68cd4
          <Ionicons
            name="settings-outline"
            size={24}
            color="black"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      )}

<<<<<<< HEAD
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
=======
      {option !== "person" && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity>
            <Image
              source={require("../../assets/qr.png")}
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>

          <Menu>
            <MenuTrigger>
              <Icon
                name="add"
                size={HEADER_HEIGHT * 0.5}
                color="white"
                style={{ marginLeft: 10 }}
              />
            </MenuTrigger>
            <MenuOptions
              optionsContainerStyle={{
                width: 240,
                borderRadius: 10,
                backgroundColor: "white",
                padding: 10,
              }}
            >
              <MenuOption onSelect={() => alert("Thêm bạn")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Icon
                    name="person-add"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{ fontSize: 16 }}>Thêm bạn</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Tạo nhóm")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Icon
                    name="group-add"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{ fontSize: 16 }}>Tạo nhóm</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Gửi danh bạ")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Icon
                    name="contacts"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{ fontSize: 16 }}>Gửi danh bạ</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Lịch Zalo")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Icon
                    name="event"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{ fontSize: 16 }}>Lịch Zalo</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Tạo cuộc gọi nhóm")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Icon
                    name="call"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{ fontSize: 16 }}>Tạo cuộc gọi nhóm</Text>
                </View>
              </MenuOption>
              <MenuOption onSelect={() => alert("Thiết bị đăng nhập")}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 10,
                  }}
                >
                  <Icon
                    name="devices"
                    size={20}
                    color="black"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={{ fontSize: 16 }}>Thiết bị đăng nhập</Text>
                </View>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      )}
>>>>>>> efd88a4c37eb2a37cfec15487b23592e41a68cd4
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