import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import InfoAddFriendMModal from "../../component/InfoAddFriendModal";
import { getRoomChatByPhoneService } from "../../service/roomChatService";

const ChatInfoScreen = ({ route }) => {
  const [item, setItem] = useState(route.params?.receiver); // click conversation
  const receiver = route.params?.receiver; // click conversation
  let socketRef = route.params?.socketRef;
  let onlineUsers = route.params?.onlineUsers;
  const user = useSelector((state) => state.auth.user);
  const conversations = route.params?.conversations;

  const mediaMessages = route.params?.mediaMessages;
  const fileMessages = route.params?.fileMessages;
  const linkMessages = route.params?.linkMessages;

  const navigation = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchResult, setSearchResult] = useState({});

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSearch = async () => {
    let response = await getRoomChatByPhoneService(item.phone);

    if (response.EC === 0) {
      setSearchResult(response.DT);
    } else {
      alert(response.EM);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  // action socket
  useEffect(() => {}, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate("InboxScreen", {
                item,
                socketRef,
                onlineUsers,
                conversations,
              })
            }
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tùy chọn</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: receiver.avatar }}
              style={styles.profileImage}
            />
            <View style={styles.editIconContainer}>
              <Feather name="edit-2" size={14} color="#000" />
            </View>
          </View>
          <Text style={styles.profileName}>Công nghệ mới</Text>

          <View style={styles.actionIcons}>
            <TouchableOpacity style={{ alignItems: "center" }}>
              <View style={styles.actionIcon}>
                <Feather name="search" size={24} color="#555" />
              </View>
              <Text style={{ fontSize: 12, color: "#555" }}>Tìm kiếm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center" }}
              onPress={openModal}
            >
              <View style={styles.actionIcon}>
                <Feather name="user" size={24} color="#555" />
              </View>
              <Text style={{ fontSize: 12, color: "#555" }}>Xem hồ sơ</Text>
            </TouchableOpacity>
            <InfoAddFriendMModal
              isOpen={isOpen}
              closeModal={closeModal}
              user={searchResult}
              socketRef={socketRef}
            />
            <TouchableOpacity style={{ alignItems: "center" }}>
              <View style={styles.actionIcon}>
                <FontAwesome5 name="brush" size={24} color="#555" />
              </View>
              <Text style={{ fontSize: 12, color: "#555" }}>Đổi hình nền</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ alignItems: "center" }}>
              <View style={styles.actionIcon}>
                <Feather name="bell-off" size={24} color="#555" />
              </View>
              <Text style={{ fontSize: 12, color: "#555" }}>Tắt thông báo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="edit-2"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Đổi tên gợi nhớ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() =>
              navigation.navigate("MediaFilesLinksScreen", {
                mediaMessages,
                fileMessages,
                linkMessages,
              })
            }
          >
            <Feather
              name="image"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <View style={styles.optionContent}>
              <Text style={styles.optionText}>Ảnh, video, file, link</Text>
              <Text style={styles.optionSubtext}>
                {mediaMessages.length > 0 ||
                fileMessages.length > 0 ||
                linkMessages.length > 0
                  ? "Xem các nội dung đã chia sẻ"
                  : "Chưa có nội dung nào được chia sẻ"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="users"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Xem nhóm chung (14)</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="trash-2"
              size={20}
              color="#ff3b30"
              style={styles.optionIcon}
            />
            <Text style={[styles.optionText, styles.deleteText]}>
              Xóa lịch sử trò chuyện
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
    gap: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editIconContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  actionIcons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f2f5",
    justifyContent: "center",
    alignItems: "center",
  },
  optionsContainer: {
    backgroundColor: "white",
    marginTop: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
  },
  optionIcon: {
    marginRight: 16,
    width: 24,
    textAlign: "center",
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  optionSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  switch: {
    marginLeft: "auto",
  },
  arrowIcon: {
    marginLeft: "auto",
  },
  deleteText: {
    color: "#ff3b30",
  },
  gridBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
  },
  badge: {
    backgroundColor: "#007bff",
    color: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    backgroundColor: "#ff3b30",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "white",
    fontSize: 14,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ChatInfoScreen;
