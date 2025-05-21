import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { getAllFriendsService } from "../../service/friendShipService";
import {
  addMembersToRoomChatService,
  getRoomChatByPhoneService,
  getRoomChatMembersService,
} from "../../service/roomChatService";
import { updatePermission } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;

const AddMemberModal = ({ show, onHide, roomId, user, socketRef, roomData }) => {
  const [friends, setFriends] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  console.log("socketRef", socketRef);

  useEffect(() => {
    const fetchFriendsAndMembers = async () => {
      setLoading(true);
      try {
        const friendsResponse = await getAllFriendsService();
        setFriends(friendsResponse.DT || []);
        const membersResponse = await getRoomChatMembersService(roomId);
        setMembers(membersResponse.DT || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (show) fetchFriendsAndMembers();
  }, [show, roomId]);

  useEffect(() => {
    const search = async () => {
      if (searchTerm.length === 10 && /^\d+$/.test(searchTerm)) {
        try {
          const response = await getRoomChatByPhoneService(searchTerm);
          const searchResult = response.DT ? [response.DT] : [];
          setSearchResults(searchResult);
        } catch (error) {
          setSearchResults([]);
        }
      } else if (searchTerm.trim() === "") {
        setSearchResults([]);
      } else if (/^\d+$/.test(searchTerm)) {
        setSearchResults([]);
      } else {
        const filteredFriends = friends.filter((friend) =>
          friend.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filteredFriends);
      }
    };
    search();
  }, [searchTerm, friends]);

  const isMember = (friendId) =>
    members.some((member) => member._id === friendId);

  const handleSelectFriend = (friend) => {
    if (selectedFriends.some((selected) => selected._id === friend._id)) {
      setSelectedFriends(
        selectedFriends.filter((selected) => selected._id !== friend._id)
      );
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const displayList =
    searchResults.length > 0
      ? searchResults
      : [
        ...selectedFriends,
        ...friends.filter(
          (friend) =>
            !selectedFriends.some((selected) => selected._id === friend._id)
        ),
      ];

  const handleClose = () => {
    setFriends([]);
    setMembers([]);
    setSelectedFriends([]);
    setSearchTerm("");
    setSearchResults([]);
    onHide();
  };

  const handleAddMembers = async () => {
    Alert.alert("Thông báo", "Đang xử lý, vui lòng chờ..."); // Thông báo ngay khi ấn xác nhận

    if (selectedFriends.length === 0) {
      Alert.alert(
        "Thông báo",
        "Vui lòng chọn ít nhất một thành viên để thêm vào nhóm."
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await addMembersToRoomChatService(roomId, selectedFriends);
      if (response.EC === 0) {
        socketRef.current.emit("REQ_ADD_GROUP", response.DT);
        Alert.alert("Thành công", "Thêm thành viên thành công!");
        let res = await dispatch(
          updatePermission({
            groupId: roomId,
            newPermission: roomData.receiver.permission,
          })
        );
        handleClose();
      } else {
        Alert.alert("Lỗi", response.EM || "Có lỗi xảy ra khi thêm thành viên.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi thêm thành viên.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFriendItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Image
        source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
        style={styles.avatar}
      />
      <View style={styles.memberInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      {isMember(item._id) ? (
        <Text style={styles.joinedStatus}>Đã tham gia</Text>
      ) : (
        <TouchableOpacity
          style={[
            styles.checkbox,
            selectedFriends.some((selected) => selected._id === item._id) &&
            styles.checkboxSelected,
          ]}
          onPress={() => handleSelectFriend(item)}
        >
          {selectedFriends.some((selected) => selected._id === item._id) && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSelectedFriendItem = ({ item }) => (
    <View style={styles.selectedItem}>
      <Image
        source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
        style={styles.selectedAvatar}
      />
      <View style={styles.selectedInfo}>
        <Text style={styles.selectedUsername}>{item.username}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleSelectFriend(item)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={show}
      onRequestClose={handleClose}
      animationType="slide"
      transparent={true}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Thêm thành viên</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search input */}
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập tên hoặc số tài khoản"
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#aaa"
            />

            {/* Loading indicator */}
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#007bff"
                style={styles.loading}
              />
            ) : (
              <View
                style={[
                  styles.listContainer,
                  isTablet && { flexDirection: "row" },
                ]}
              >
                {/* Friends list */}
                <View
                  style={[
                    styles.friendsListContainer,
                    isTablet
                      ? { maxHeight: height * 0.5, minWidth: width * 0.45 }
                      : { maxHeight: height * 0.35 },
                  ]}
                >
                  {searchTerm.length > 0 &&
                    /^\d+$/.test(searchTerm) &&
                    searchTerm.length < 10 ? (
                    <Text style={styles.noResults}>Không tìm thấy kết quả</Text>
                  ) : displayList.length > 0 ? (
                    <FlatList
                      data={displayList}
                      renderItem={renderFriendItem}
                      keyExtractor={(item) => item._id}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 10 }}
                    />
                  ) : (
                    <Text style={styles.noResults}>Không tìm thấy kết quả</Text>
                  )}
                </View>

                {/* Selected friends list */}
                {selectedFriends.length > 0 && (
                  <View
                    style={[
                      styles.selectedListContainer,
                      isTablet
                        ? {
                          marginLeft: 16,
                          width: width * 0.25,
                          maxHeight: height * 0.5,
                        }
                        : { marginTop: 10, maxHeight: height * 0.15 },
                    ]}
                  >
                    <Text style={styles.selectedHeader}>
                      Đã chọn ({selectedFriends.length})
                    </Text>
                    <FlatList
                      data={selectedFriends}
                      renderItem={renderSelectedFriendItem}
                      keyExtractor={(item) => item._id}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: 10 }}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Footer buttons */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  isSubmitting && styles.disabledButton,
                ]}
                onPress={handleAddMembers}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    marginHorizontal: isTablet ? width * 0.18 : 16,
    borderRadius: 12,
    padding: isTablet ? 28 : 16,
    maxHeight: isTablet ? height * 0.85 : height * 0.95,
    width: isTablet ? width * 0.65 : "95%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: isTablet ? 18 : 12,
  },
  title: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: "bold",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: isTablet ? 14 : 10,
    marginBottom: isTablet ? 18 : 12,
    fontSize: isTablet ? 18 : 15,
  },
  listContainer: {
    flex: 1,
    flexDirection: "column",
  },
  friendsListContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: isTablet ? 14 : 10,
    backgroundColor: "#fafbfc",
  },
  selectedListContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: isTablet ? 14 : 10,
    backgroundColor: "#f5f7fa",
  },
  selectedHeader: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: isTablet ? 16 : 13,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: isTablet ? 12 : 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: isTablet ? 48 : 40,
    height: isTablet ? 48 : 40,
    borderRadius: isTablet ? 24 : 20,
    marginRight: isTablet ? 14 : 10,
  },
  memberInfo: {
    flex: 1,
  },
  username: {
    fontWeight: "bold",
    fontSize: isTablet ? 17 : 14,
  },
  phone: {
    fontSize: isTablet ? 14 : 12,
    color: "#888",
  },
  joinedStatus: {
    color: "#888",
    fontSize: isTablet ? 14 : 12,
  },
  checkbox: {
    width: isTablet ? 28 : 24,
    height: isTablet ? 28 : 24,
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: "#007bff",
  },
  checkmark: {
    color: "white",
    fontWeight: "bold",
    fontSize: isTablet ? 18 : 15,
  },
  selectedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: isTablet ? 8 : 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedAvatar: {
    width: isTablet ? 36 : 30,
    height: isTablet ? 36 : 30,
    borderRadius: isTablet ? 18 : 15,
    marginRight: isTablet ? 8 : 5,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedUsername: {
    fontWeight: "bold",
    fontSize: isTablet ? 15 : 12,
  },
  removeButton: {
    width: isTablet ? 24 : 20,
    height: isTablet ? 24 : 20,
    borderRadius: isTablet ? 12 : 10,
    borderWidth: 1,
    borderColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#007bff",
    fontSize: isTablet ? 16 : 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: isTablet ? 22 : 15,
    paddingTop: isTablet ? 18 : 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: isTablet ? 22 : 15,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  confirmButton: {
    backgroundColor: "#007bff",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: isTablet ? 17 : 14,
  },
  loading: {
    marginVertical: 20,
  },
  noResults: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: isTablet ? 16 : 13,
  },
});

export default AddMemberModal;