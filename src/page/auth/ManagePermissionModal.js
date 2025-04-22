import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { useSelector } from "react-redux";
import {
  getAllMemberGroupService,
  getMemberByPhoneService,
} from "../../service/roomChatService";
import { updateDeputyService } from "../../service/permissionService";
import { Search } from "lucide-react-native";

const ManagePermissionModal = ({ closeModal, receiver, socketRef }) => {
  const user = useSelector((state) => state.auth.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Thêm phó nhóm");

  const fetchAllMembers = async () => {
    try {
      const response = await getAllMemberGroupService(receiver._id);
      if (response.EC === 0) {
        setSearchResults(response.DT);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thành viên:", error);
    }
  };

  useEffect(() => {
    fetchAllMembers();
  }, []);

  const handleSearchPhone = async (text) => {
    setSearchTerm(text);
    const trimmed = text.trim();

    if (!trimmed) {
      fetchAllMembers();
      return;
    }

    const isPhone = /^\d+$/.test(trimmed);
    if (!isPhone) {
      fetchAllMembers();
      return;
    }

    try {
      const response = await getMemberByPhoneService(trimmed, receiver._id);
      if (response.EC === 0) {
        setSearchResults(response.DT);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm theo SĐT:", error);
      setSearchResults([]);
    }
  };

  const handleSelectUser = (targetUser) => {
    const exists = members.find((u) => u._id === targetUser._id);
    if (exists) {
      setMembers((prev) => prev.filter((u) => u._id !== targetUser._id));
    } else {
      if (selectedTab === "Chuyển quyền trưởng nhóm") {
        setMembers([targetUser]);
      } else {
        setMembers((prev) => [...prev, targetUser]);
      }
    }
  };

  const isSelected = (userId) => members.some((u) => u._id === userId);

  useEffect(() => {
    if (selectedTab === "Thêm phó nhóm") {
      const deputies = searchResults.filter((u) => u.role === "deputy");
      setMembers((prev) => {
        const ids = prev.map((u) => u._id);
        const newOnes = deputies.filter((d) => !ids.includes(d._id));
        return [...prev, ...newOnes];
      });
    } else {
      setMembers([]);
    }
  }, [selectedTab, searchResults]);

  const handleConfirm = async () => {
    if (selectedTab === "Thêm phó nhóm") {
      const res = await updateDeputyService(members);
      if (res.EC === 0) {
        closeModal();
        socketRef.current.emit("REQ_UPDATE_DEPUTY", res.DT);
      } else {
        Alert.alert("Lỗi", res.EM || "Không thể cập nhật");
      }
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleSelectUser(item)}
    >
      <View style={styles.userInfo}>
        <Image
          source={{ uri: item.avatar || "https://via.placeholder.com/40" }}
          style={styles.avatar}
        />
        <Text style={styles.userText}>
          {item.nameSender || item.phoneSender}
        </Text>
      </View>
      <Text>{isSelected(item._id) ? "✅" : "➕"}</Text>
    </TouchableOpacity>
  );

  const renderSelectedUser = (member) => (
    <View key={member._id} style={styles.selectedUser}>
      <Image
        source={{ uri: member.avatar || "https://via.placeholder.com/40" }}
        style={styles.avatar}
      />
      <Text style={styles.userText}>
        {member.phoneSender === user.phone
          ? "Bạn"
          : member.name || member.phoneSender}
      </Text>
      {member.phoneSender !== user.phone && (
        <TouchableOpacity onPress={() => handleSelectUser(member)}>
          <Text style={styles.removeText}>Xóa</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>{selectedTab}</Text>

          <View style={styles.tabContainer}>
            {["Thêm phó nhóm", "Chuyển quyền trưởng nhóm"].map((tab, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tabButton,
                  selectedTab === tab && styles.activeTab,
                ]}
                onPress={() => {
                  setSelectedTab(tab);
                  setMembers([]);
                }}
              >
                <Text style={styles.tabText}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchBox}>
            <Search size={16} color="#888" />
            <TextInput
              placeholder="Nhập tên, số tài khoản"
              style={styles.input}
              value={searchTerm}
              onChangeText={handleSearchPhone}
            />
          </View>

          <View style={styles.memberContainer}>
  <View style={styles.memberList}>
    <Text style={styles.subHeader}>Thành viên trong nhóm</Text>
    <FlatList
      data={searchResults}
      keyExtractor={(item) => item._id}
      renderItem={renderUserItem}
    />
  </View>

  <View style={styles.selectedList}>
    <Text style={styles.subHeader}>Đã chọn</Text>
    <ScrollView>{members.map(renderSelectedUser)}</ScrollView>
  </View>
</View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
              <Text style={styles.footerText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
              <Text style={styles.footerText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ManagePermissionModal;

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  subHeader: { marginTop: 12, fontWeight: "600", fontSize: 16 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  input: { flex: 1, padding: 8 },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  userText: { fontSize: 14 },
  tabContainer: { flexDirection: "row", marginBottom: 12 },
  tabButton: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#007bff",
  },
  tabText: {
    color: "#000",
    fontWeight: "500",
  },
  selectedContainer: { marginTop: 12 },
  selectedUser: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  removeText: {
    color: "red",
    marginLeft: 10,
    marginRight: 8,
  },
  footer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 8,
    marginRight: 8,
  },
  confirmBtn: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 8,
  },
  footerText: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },

  memberContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  memberList: {
    flex: 1.5,
  },
  selectedList: {
    flex: 1,
    paddingLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
  },
});
