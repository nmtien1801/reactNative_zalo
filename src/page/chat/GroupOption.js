import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Modal,
  FlatList
} from "react-native";
import { Feather } from "@expo/vector-icons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { getRoomChatMembersService } from "../../service/roomChatService";
import { removeMemberFromGroupService } from "../../service/chatService";
import AddMemberModal from "./AddMemberModal";
import { useSelector } from "react-redux";


const ChatInfoScreen = ({ route }) => {
  let item = route.params?.receiver; // click conversation
  console.log("item", item._id);
  const user = useSelector((state) => state.auth.user);

  const receiver = route.params?.receiver; // click conversation
  console.log("receiver", receiver._id);
  const [members, setMembers] = useState([]); // Danh sách thành viên
  const [showMemberModal, setShowMemberModal] = useState(false); // Trạng thái hiển thị modal

  const [showAddMemberModal, setShowAddMemberModal] = useState(false); // State quản lý modal

  const handleOpenAddMemberModal = () => {
    setShowAddMemberModal(true); // Mở modal
  };

  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false); // Đóng modal
  };



  let socketRef = route.params?.socketRef;
  let onlineUsers = route.params?.onlineUsers;
  const conversations = route.params?.conversations;
  const navigation = useNavigation();
  const [isReportCallsEnabled, setIsReportCallsEnabled] = useState(true);
  const [isHiddenChatEnabled, setIsHiddenChatEnabled] = useState(false);

  const toggleReportCalls = () => {
    setIsReportCallsEnabled((previousState) => !previousState);
  };

  const toggleHiddenChat = () => {
    setIsHiddenChatEnabled((previousState) => !previousState);
  };


  // Lấy danh sách thành viên nhóm
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (receiver?._id) {
          const response = await getRoomChatMembersService(receiver._id);
          console.log("response", response);
          if (response.EC === 0) {
            setMembers(response.DT);
          } else {
            console.error("Lỗi khi lấy danh sách thành viên:", response.EM);
          }
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    };

    fetchMembers();
  }, [receiver?._id]);

  // Xử lý xóa thành viên
  // const handleRemoveMember = async (memberId) => {
  //   try {
  //     const response = await removeMemberFromGroupService(receiver._id, memberId);
  //     if (response.EC === 0) {
  //       Alert.alert("Thành công", "Xóa thành viên khỏi nhóm thành công!");
  //       setMembers((prevMembers) => prevMembers.filter((member) => member._id !== memberId));
  //     } else {
  //       Alert.alert("Lỗi", response.EM || "Không thể xóa thành viên.");
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi gọi API xóa thành viên:", error);
  //     Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa thành viên.");
  //   }
  // };

  const handleRemoveMember = (memberId) => {
    removeMemberFromGroupService(receiver._id, memberId);
    setMembers((prevMembers) => prevMembers.filter((member) => member._id !== memberId));
  };


  // ManageGroup
  const [role, setRole] = useState("member");
  useEffect(() => {
    const role = conversations.find(
      (conversation) => conversation._id === item._id
    );
    if (role) {
      setRole(role.role);
    }
  }, [conversations, item]);

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
              source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
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
              onPress={() => handleOpenAddMemberModal()} // Show the modal
            >
              <View style={styles.actionIcon}>
                <Feather name="user-plus" size={24} color="#555" />
              </View>
              <Text style={{ fontSize: 12, color: "#555" }}>Thêm thành viên</Text>
            </TouchableOpacity>
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


          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setShowMemberModal(true)}
          >
            <Feather name="users" size={20} color="#555" style={styles.optionIcon} />
            <Text style={styles.optionText}>Thành viên</Text>
            <Text style={styles.badge}>{members.length}</Text>
          </TouchableOpacity>

          {/* Modal danh sách thành viên */}
          <Modal
            visible={showMemberModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowMemberModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Danh sách thành viên</Text>
                <FlatList
                  data={members}
                  keyExtractor={(item) => item._id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.memberItem}>
                      <View style={styles.memberInfo}>
                        <Image
                          source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
                          style={styles.memberAvatar}
                        />
                        <Text style={styles.memberName}>{item.username}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveMember(item._id)}
                      >
                        <Text style={styles.removeButtonText}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowMemberModal(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>


          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="edit-2"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Đổi tên gợi nhớ</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="image"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <View style={styles.optionContent}>
              <Text style={styles.optionText}>File, ảnh, Video</Text>
              <Text style={styles.optionSubtext}>
                Chưa có File nào được chia sẻ trong hội thoại này
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="users"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Xem nhóm chung (14)</Text>
          </TouchableOpacity>

          {(role === "leader" || role === "deputy") && (
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() =>
                navigation.navigate("ManageGroup", {
                  receiver: item,
                  socketRef,
                  onlineUsers,
                  conversations,
                })
              }
            >
              <Feather
                name="settings"
                size={20}
                color="#555"
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Quản lý nhóm</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="eye-off"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Ẩn trò chuyện</Text>
            <Switch
              trackColor={{ false: "#d1d1d1", true: "#81b0ff" }}
              thumbColor={isHiddenChatEnabled ? "#2196F3" : "#f4f3f4"}
              ios_backgroundColor="#d1d1d1"
              onValueChange={toggleHiddenChat}
              value={isHiddenChatEnabled}
              style={styles.switch}
            />
          </TouchableOpacity>

          <View style={styles.optionItem}>
            <Feather
              name="phone-incoming"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Báo cáo cuộc gọi đến</Text>
            <Switch
              trackColor={{ false: "#d1d1d1", true: "#81b0ff" }}
              thumbColor={isReportCallsEnabled ? "#2196F3" : "#f4f3f4"}
              ios_backgroundColor="#d1d1d1"
              onValueChange={toggleReportCalls}
              value={isReportCallsEnabled}
              style={styles.switch}
            />
          </View>

          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="clock"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <View style={styles.optionContent}>
              <Text style={styles.optionText}>Tin nhắn tự xóa</Text>
              <Text style={styles.optionSubtext}>Không bao giờ</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="user"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Cài đặt cá nhân</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="alert-triangle"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Báo xấu</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="slash"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Quản lý chặn</Text>
            <Feather
              name="chevron-right"
              size={20}
              color="#555"
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <Feather
              name="database"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Dung lượng trò chuyện</Text>
          </TouchableOpacity>

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
      {/* Modal AddMember */}
      <AddMemberModal
        show={showAddMemberModal} // Truyền state hiển thị
        onHide={handleCloseAddMemberModal} // Truyền hàm đóng modal
        roomId={item._id} // Truyền roomId của nhóm
        user={user} // Truyền thông tin người dùng
        socketRef={socketRef} // Truyền socketRef
      />
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
