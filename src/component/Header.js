import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AddFriendModal from "./AddFriendModal";

const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = height * 0.08;

export default function SearchHeader({ option, socketRef, onlineUsers }) {
  const navigation = useNavigation();
  const [showModalAddFriend, setShowModalAddFriend] = useState(false); // Modal thêm bạn
  const [modalVisible, setModalVisible] = useState(false); // Trạng thái điều khiển modal tùy chọn

  const options = [
    {
      icon: "person-add",
      iconLibrary: "Ionicons",
      text: "Thêm bạn",
      action: () => {
        setShowModalAddFriend(true);
        setModalVisible(false);
      },
    },
    {
      icon: "users",
      iconLibrary: "FontAwesome5",
      text: "Tạo nhóm",
      action: () => {
        navigation.navigate("CreateGroupTab");
        setModalVisible(false);
      },
    },
  ];

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
        onFocus={() =>
          navigation.navigate("SearchScreen", {
            socketRef,
            onlineUsers,
          })
        }
      />

      {option === "person" && (
        <TouchableOpacity onPress={() => navigation.navigate("Setting")}>
          <Ionicons
            name="settings-outline"
            size={24}
            color="black"
            style={{ marginLeft: 10 }}
          />
        </TouchableOpacity>
      )}

      {option !== "person" && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity>
            <Image
              source={require("../../assets/qr.png")}
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon
              name="add"
              size={HEADER_HEIGHT * 0.5}
              color="white"
              style={{ marginLeft: 10 }}
            />
          </TouchableOpacity>

          <Modal
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
              activeOpacity={1}
              onPress={() => setModalVisible(false)} // Đóng modal khi nhấn bên ngoài
            >
              <View
                style={{
                  position: "absolute",
                  top: HEADER_HEIGHT, // Đặt ngay dưới header
                  right: 15, // Căn lề phải
                  backgroundColor: "white",
                  borderRadius: 10,
                  padding: 10,
                  width: 240,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              >
                <ScrollView>
                  {options.map((opt, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                        paddingHorizontal: 10,
                      }}
                      onPress={opt.action}
                    >
                      {opt.iconLibrary === "Ionicons" ? (
                        <Icon
                          name={opt.icon}
                          size={20}
                          color="black"
                          style={{ marginRight: 10 }}
                        />
                      ) : (
                        <FontAwesome5
                          name={opt.icon}
                          size={20}
                          color="black"
                          style={{ marginRight: 10 }}
                          solid
                        />
                      )}
                      <Text style={{ fontSize: 16 }}>{opt.text}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          <AddFriendModal
            show={showModalAddFriend}
            onHide={() => setShowModalAddFriend(false)}
            socketRef={socketRef}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
