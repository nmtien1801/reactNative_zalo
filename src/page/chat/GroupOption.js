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
  FlatList,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import InfoAddFriendMModal from "../../component/InfoAddFriendModal";
import { getRoomChatByPhoneService } from "../../service/roomChatService";
import { getRoomChatMembersService } from "../../service/roomChatService";
import { removeMemberFromGroupService } from "../../service/chatService";
import AddMemberModal from "./AddMemberModal";
import { dissolveGroupService } from "../../service/chatService";
import { launchImageLibrary } from "react-native-image-picker";
import { uploadAvatar } from "../../redux/profileSlice.js";
import { Platform } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { uploadAvatarGroup } from "../../redux/profileSlice.js";
import { transLeaderService } from "../../service/permissionService";

const ChatInfoScreen = ({ route }) => {
  const [item, setItem] = useState(route.params?.receiver); // click conversation
  const receiver = route.params?.receiver; // click conversation
  const [members, setMembers] = useState([]); // Danh sách thành viên
  let socketRef = route.params?.socketRef;
  let onlineUsers = route.params?.onlineUsers;
  const user = useSelector((state) => state.auth.user);
  const conversations = route.params?.conversations;
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isReportCallsEnabled, setIsReportCallsEnabled] = useState(true);
  const [isHiddenChatEnabled, setIsHiddenChatEnabled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchResult, setSearchResult] = useState({});
  const [showMemberModal, setShowMemberModal] = useState(false); // Trạng thái hiển thị modal
  const [photo, setPhoto] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false); // State quản lý modal

  const handleOpenAddMemberModal = () => {
    setShowAddMemberModal(true); // Mở modal
  };

  const handleCloseAddMemberModal = () => {
    setShowAddMemberModal(false); // Đóng modal
  };
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSearch = async () => {
    let response = await getRoomChatByPhoneService(item.phone);

    if (response.EC === 0) {
      setSearchResult(response.DT);
    } else {
      console.log("Lỗi khi tìm kiếm:", response.EM);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

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

  const handleRemoveMember = async (memberId) => {
    // Chuyển quyền trưởng nhóm
    if (receiver.role === "leader" && memberId === user._id) {
      const otherMembers = receiver.members.filter((m) => m !== user._id);

      if (otherMembers.length > 0) {
        // Chọn ngẫu nhiên 1 người trong danh sách
        const randomIndex = Math.floor(Math.random() * otherMembers.length);
        const newLeaderId = otherMembers[randomIndex];

        // Gọi API chuyển quyền
        let response = await transLeaderService(receiver._id, newLeaderId);

        if (response.EC === 0) {
          socketRef.current.emit("REQ_TRANS_LEADER", response.DT);
        }
      }

      navigation.navigate("MainTabs", {
        socketRef,
      });
    }

    let res = await removeMemberFromGroupService(receiver._id, memberId);
    let req = {
      member: memberId,
      all: members,
    }
    socketRef.current.emit("REQ_REMOVE_MEMBER", req);
  };

  // ManageGroup
  const [role, setRole] = useState(route.params.role); // click conversation

  useEffect(() => {
    const role = conversations.find(
      (conversation) => conversation._id === item._id
    );
    if (role) {
      setRole(role.role);
    }
  }, []);

  // action socket
  useEffect(() => {
    socketRef.current.on("RES_MEMBER_PERMISSION", (data) => {
      const member = data.find((item) => item.sender._id === user._id);

      setItem({
        ...item,
        permission: member.receiver.permission,
        role: member.role,
      });
    });

    socketRef.current.on("RES_UPDATE_DEPUTY", (data) => {
      // Nếu không có bản ghi nào được cập nhật
      if (data.length === 0) {
        setRole("member");
        return;
      }

      // Tìm xem user có phải là sender hoặc receiver không
      const member = data.find(
        (item) =>
          item?.sender?._id === user._id || item?.receiver?._id === user._id
      );

      if (member) {
        setRole(member.role);
        setItem({
          ...item,
          permission: member.receiver.permission,
          role: member.role,
        });
      } else {
        if (receiver.role !== "leader") {
          setRole("member");
        }
      }
    });

    socketRef.current.on("RES_TRANS_LEADER", (data) => {
      const { newLeader, oldLeader } = data;
      let member = null;
      if (newLeader?.sender?._id === user._id) {
        member = newLeader;
      } else if (oldLeader?.sender?._id === user._id) {
        member = oldLeader;
      }

      if (member) {
        setRole(member.role);
        setItem({
          ...item,
          role: member.role,
        });
      } else {
        setRole("member");
        setItem({
          ...item,
          role: "member",
        });
      }
    });

    socketRef.current.on("RES_REMOVE_MEMBER", (data) => {
      if (receiver.role !== "leader" && data.member === user._id) {
        navigation.navigate("MainTabs", {
          socketRef,
        });
      }
      const fetchMembers = async () => {
        try {
          if (receiver?._id) {
            const response = await getRoomChatMembersService(receiver._id);
            if (response.EC === 0) {
              setMembers(response.DT); // Lưu danh sách thành viên vào state
            } else {
              console.error("Lỗi khi lấy danh sách thành viên:", response.EM);
            }
          }
        } catch (error) {
          console.error("Lỗi khi gọi API getRoomChatMembersService:", error);
        }
      };
      fetchMembers();
    });

    // add member group
    socketRef.current.on("RES_ADD_GROUP", (data) => {
      const fetchMembers = async () => {
        try {
          if (receiver?._id) {
            const response = await getRoomChatMembersService(receiver._id);
            if (response.EC === 0) {
              setMembers(response.DT); // Lưu danh sách thành viên vào state
            } else {
              console.error("Lỗi khi lấy danh sách thành viên:", response.EM);
            }
          }
        } catch (error) {
          console.error("Lỗi khi gọi API getRoomChatMembersService:", error);
        }
      };
      fetchMembers();
    });
  }, []);
  console.log("role", role);

  // Handle dissolve group
  const handleDissolveGroup = async () => {
    try {
      Alert.alert("Thông báo", "Đang giải tán nhóm...");

      const response = await dissolveGroupService(item._id);

      const { EC, EM } = response || {};

      if (EC === 0) {
        Alert.alert("Thành công", "Nhóm đã được giải tán!");
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "MainTabs",
              state: {
                index: 0,
                routes: [{ name: "Tin nhắn" }],
              },
            },
          ],
        });
        socketRef.current.emit("REQ_DISSOLVE_GROUP", item);
      } else {
        Alert.alert("Lỗi", EM || "Không thể giải tán nhóm.");
      }
    } catch (error) {
      console.error("Lỗi khi giải tán nhóm:", error);
      Alert.alert("Lỗi", "Không thể giải tán nhóm, vui lòng thử lại sau.");
    }
  };

  useEffect(() => {
    if (receiver?.avatar) {
      setUploadedUrl(receiver.avatar);
    }
  }, [receiver?.avatar]);

  const createFormData = (photo) => {
    const data = new FormData();
    if (Platform.OS === "android" || Platform.OS === "ios") {
      data.append("avatar", {
        uri: photo.uri,
        name: photo.name || "photo.jpg",
        type: photo.mimeType || "image/jpeg",
      });
    } else {
      data.append("avatar", photo.uri);
      data.append("fileName", photo.name);
      data.append("mimeType", photo.mimeType);
    }

    return data;
  };

  // Hàm chọn ảnh từ thư viện hoặc camera
  const pickImage = async () => {
    launchImageLibrary(
      { mediaType: "photo", includeBase64: false },
      async (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorMessage) {
          console.log("ImagePicker Error: ", response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setPhoto(response.assets[0]);
        }
      }
    );
  };

  useEffect(() => {
    if (photo) {
      handleUploadPhoto();
    }
  }, [photo]);

  const handleUploadPhoto = async () => {
    if (!photo) {
      Alert.alert("Chưa chọn ảnh");
      return;
    }

    try {
      const formData = createFormData(photo);
      const res = await dispatch(uploadAvatar(formData)).unwrap();

      console.log("Upload thành công:", res);
      if (res.EC === 0) {
        setUploadedUrl(res.DT); // link ảnh server trả về
        let a = await dispatch(
          uploadAvatarGroup({ groupId: item._id, avatar: res.DT })
        );

        if (a.payload.EC === 0) {
          Alert.alert("Upload thành công!", `Link: ${res.DT}`);
          socketRef.current.emit("REQ_UPDATE_AVATAR", receiver);
        }
      }
    } catch (error) {
      console.error("Upload thất bại:", error);
      Alert.alert("Lỗi upload", error.message);
    }
  };

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
              source={{
                uri:
                  uploadedUrl ||
                  "https://randomuser.me/api/portraits/men/32.jpg",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.editIconContainer}
              onPress={() => {
                if (
                  item.permission.includes(2) ||
                  item.role === "leader" ||
                  item.role === "deputy"
                ) {
                  pickImage();
                } else {
                  Alert.alert("Không có quyền thêm");
                }
              }}
            >
              <Feather name="edit-2" size={14} color="#000" />
            </TouchableOpacity>
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
              onPress={() => {
                if (
                  item.permission.includes(2) ||
                  item.role === "leader" ||
                  item.role === "deputy"
                ) {
                  handleOpenAddMemberModal();
                } else {
                  Alert.alert("Không có quyền thêm");
                }
              }}
            >
              <View style={styles.actionIcon}>
                <Feather name="user-plus" size={24} color="#555" />
              </View>
              <Text style={{ fontSize: 12, color: "#555" }}>
                Thêm thành viên
              </Text>
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
          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => setShowMemberModal(true)}
          >
            <Feather
              name="users"
              size={20}
              color="#555"
              style={styles.optionIcon}
            />
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
                          source={{
                            uri:
                              item.avatar || "https://via.placeholder.com/40",
                          }}
                          style={styles.memberAvatar}
                        />
                        <Text style={styles.memberName}>{item.username}</Text>
                      </View>
                      {((role === "leader" && item.role != "leader") ||
                        (role === "deputy" && item.role != "leader")) && (
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveMember(item._id)}
                        >
                          <Text style={styles.removeButtonText}>Xóa</Text>
                        </TouchableOpacity>
                      )}
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
                  role,
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

          <TouchableOpacity
            style={styles.optionItem}
            onPress={() => handleRemoveMember(user._id)}
          >
            <Feather
              name="log-out"
              size={20}
              color="#ff3b30"
              style={styles.optionIcon}
            />
            <Text style={[styles.optionText, styles.deleteText]}>
              rời khỏi nhóm
            </Text>
          </TouchableOpacity>

          {/* Thêm nút giải tán nhóm chỉ với leader */}
          {role === "leader" && (
            <TouchableOpacity
              style={styles.optionItem}
              onPress={handleDissolveGroup}
            >
              <Feather
                name="users"
                size={20}
                color="#ff3b30"
                style={styles.optionIcon}
              />
              <Text style={[styles.optionText, styles.deleteText]}>
                Giải tán nhóm
              </Text>
            </TouchableOpacity>
          )}
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
