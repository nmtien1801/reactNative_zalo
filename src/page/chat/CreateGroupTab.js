import React, { useState, useEffect } from "react";
import { launchImageLibrary } from "react-native-image-picker";
import { Platform } from "react-native";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFriendListService } from "../../service/friendShipService";
import { getUserByPhoneService } from "../../service/userService";
import { createConversationGroupService } from "../../service/chatService";
import { uploadAvatar } from "../../redux/profileSlice";

import { useSelector, useDispatch } from "react-redux";

const { width, height } = Dimensions.get("window");

const CreateGroupTab = ({ navigation, route }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [searchText, setSearchText] = useState("");
  const [contacts, setContacts] = useState([]);
  const socketRef = route.params.socketRef; // Lấy socketRef từ props

  const dispatch = useDispatch();

  const [groupAvatar, setGroupAvatar] = useState(null);

  const user = useSelector((state) => state.auth.user);
  console.log("User:", user); // Debugging log

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await getFriendListService();
        if (response.EC === 0 && response.DT) {
          const formattedContacts = response.DT.map((contact) => ({
            id: contact._id,
            username: contact.username,
            avatar: contact.avatar || "https://i.imgur.com/jUTa2UN.png",
            phone: contact.phone,
          }));
          setContacts(formattedContacts);
        } else {
          setContacts([]); // Không có bạn bè
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
        setContacts([]);
      }

      setSelectedContacts((prev) => {
        const isUserAlreadyAdded = prev.some(
          (contact) => contact.id === user._id
        );
        if (isUserAlreadyAdded) return prev;

        return [
          {
            id: user._id,
            username: user.username,
            phone: user.phone,
            avatar: user.avatar,
          },
          ...prev,
        ];
      });
    };

    fetchFriends();
  }, []);

  useEffect(() => {
    console.log("Contacts đã được cập nhật:", selectedContacts);
  }, [selectedContacts]);

  const toggleSelectContact = (contact) => {
    setSelectedContacts((prev) => {
      const isAlreadySelected = prev.some(
        (selected) => selected.id === contact.id
      );
      if (isAlreadySelected) {
        return prev.filter((selected) => selected.id !== contact.id);
      } else {
        return [...prev, contact];
      }
    });
  };

  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => toggleSelectContact(item)}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.username}</Text>
        <Text style={styles.lastActive}>{item.phone}</Text>
      </View>
      <Ionicons
        name={
          selectedContacts.includes(item)
            ? "radio-button-on"
            : "radio-button-off"
        }
        size={24}
        color={selectedContacts.includes(item) ? "#007bff" : "gray"}
      />
    </TouchableOpacity>
  );

  const handlePickAvatar = async () => {
    try {
      launchImageLibrary(
        { mediaType: "photo", includeBase64: false },
        async (response) => {
          if (response.didCancel) {
            console.log("Người dùng đã hủy chọn ảnh");
          } else if (response.errorMessage) {
            console.log("Lỗi khi chọn ảnh:", response.errorMessage);
          } else if (response.assets && response.assets.length > 0) {
            const selectedPhoto = response.assets[0];
            setGroupAvatar({
              uri: selectedPhoto.uri,
              type: selectedPhoto.type || "image/jpeg", // Loại ảnh
              fileName:
                selectedPhoto.fileName || selectedPhoto.uri.split("/").pop(), // Tên file
            });
          }
        }
      );
    } catch (error) {
      console.error("Lỗi khi chọn ảnh:", error);
    }
  };

  const renderSelectedContactItem = ({ item }) => {
    const contact = item.id ? item : contacts.find((c) => c.id === item);

    if (!contact) {
      return null;
    }

    return (
      <View style={styles.selectedContactItem}>
        <Image source={{ uri: contact.avatar }} style={styles.avatarSmall} />
        <Text style={styles.selectedContactName}>{contact.username}</Text>

        <TouchableOpacity
          disabled={user._id === contact.id}
          onPress={() => toggleSelectContact(item)}
        >
          <Ionicons name="close-circle" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

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

  const handleCreateGroup = async () => {
    try {
      // Lấy dữ liệu từ input và danh sách người dùng được chọn
      const nameGroup = groupName.trim(); // Lấy tên nhóm từ state
      const selectedMembers = selectedContacts.map((member) => member.id); // Lấy danh sách ID thành viên

      // Kiểm tra dữ liệu đầu vào
      if (!nameGroup) {
        alert("Vui lòng nhập tên nhóm.");
        return;
      }

      if (selectedMembers.length < 3) {
        alert("Vui lòng chọn ít nhất ba thành viên.");
        return;
      }

      // Xử lý upload avatar nếu có
      let avatarUrl = "";
      if (groupAvatar) {
        try {
          const formData = createFormData(groupAvatar);

          const response = await dispatch(uploadAvatar(formData)).unwrap();
          if (response.payload.EC === 0) {
            avatarUrl = response.payload.DT;
          } else {
            alert(response.payload.EM || "Lỗi khi tải lên ảnh!");
          }
        } catch (error) {
          console.error("Lỗi khi tải lên ảnh:", error);
          alert("Đã xảy ra lỗi khi tải lên ảnh.");
        }
      }

      // Nếu không có avatar, sử dụng ảnh mặc định
      if (avatarUrl.trim() === "") {
        avatarUrl = "https://i.imgur.com/jUTa2UN.png";
      }

      console.log("Danh sách thành viên:", selectedMembers);

      // Gửi yêu cầu đến API tạo nhóm
      const response = await createConversationGroupService(
        nameGroup,
        avatarUrl,
        selectedMembers
      );

      if (response.EC === 0) {
        alert("Tạo nhóm thành công!");
        socketRef.current.emit("REQ_CREATE_GROUP", response.DT);
        navigation.goBack(); // Quay lại màn hình trước
      } else {
        alert(response.EM || "Đã xảy ra lỗi khi tạo nhóm.");
      }
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      alert("Đã xảy ra lỗi khi tạo nhóm.");
    }
  };

  const handleSearchPhone = async (text) => {
    const query = text.trim(); // Loại bỏ khoảng trắng thừa
    if (!query) {
      // Nếu không có input, lấy danh sách bạn bè
      try {
        const response = await getFriendListService();
        if (response.EC === 0 && response.DT) {
          const formattedContacts = response.DT.map((contact) => ({
            id: contact._id,
            username: contact.username,
            avatar: contact.avatar || "https://i.imgur.com/jUTa2UN.png",
            phone: contact.phone,
          }));
          setContacts(formattedContacts);
        } else {
          setContacts([]); // Không có bạn bè
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
        setContacts([]);
      }
      return;
    }

    // Kiểm tra xem query có phải là số tài khoản hay không
    const isPhoneNumber = /^\d+$/.test(query);
    if (!isPhoneNumber) {
      // Nếu không phải số tài khoản, lấy danh sách bạn bè
      try {
        const response = await getFriendListService();
        if (response.EC === 0 && response.DT) {
          const formattedContacts = response.DT.map((contact) => ({
            id: contact._id,
            username: contact.username,
            avatar: contact.avatar || "https://i.imgur.com/jUTa2UN.png",
            phone: contact.phone,
          }));
          setContacts(formattedContacts);
        } else {
          setContacts([]); // Không có bạn bè
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
        setContacts([]);
      }
      return;
    }

    try {
      const response = await getUserByPhoneService(query); // Gọi API
      if (response.EC === 0 && response.DT.DT) {
        if (response.DT.DT._id !== user._id) {
          const formattedContact = {
            id: response.DT.DT._id,
            username: response.DT.DT.username,
            avatar: response.DT.DT.avatar || "https://i.imgur.com/jUTa2UN.png", // Avatar mặc định nếu không có
            phone: response.DT.DT.phone,
          };
          setContacts([formattedContact]);
        } else {
          try {
            const response = await getFriendListService();
            if (response.EC === 0 && response.DT) {
              const formattedContacts = response.DT.map((contact) => ({
                id: contact._id,
                username: contact.username,
                avatar: contact.avatar || "https://i.imgur.com/jUTa2UN.png",
                phone: contact.phone,
              }));
              setContacts(formattedContacts);
            } else {
              setContacts([]); // Không có bạn bè
            }
          } catch (error) {
            console.error("Lỗi khi lấy danh sách bạn bè:", error);
            setContacts([]);
          }
        }
      } else {
        try {
          const response = await getFriendListService();
          if (response.EC === 0 && response.DT) {
            const formattedContacts = response.DT.map((contact) => ({
              id: contact._id,
              username: contact.username,
              avatar: contact.avatar || "https://i.imgur.com/jUTa2UN.png",
              phone: contact.phone,
            }));
            setContacts(formattedContacts);
          } else {
            setContacts([]); // Không có bạn bè
          }
        } catch (error) {
          console.error("Lỗi khi lấy danh sách bạn bè:", error);
          setContacts([]);
        }
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm số tài khoản:", error);
      setContacts([]); // Xóa kết quả nếu có lỗi
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhóm mới</Text>
        <Text style={styles.selectedCount}>
          Đã chọn: {selectedContacts.length}
        </Text>
      </View>

      {/* Group Name Input */}
      <View style={styles.groupNameContainer}>
        <TouchableOpacity
          style={styles.avatarPicker}
          onPress={handlePickAvatar}
        >
          {groupAvatar ? (
            <Image
              source={{ uri: groupAvatar.uri }}
              style={styles.groupAvatar}
            />
          ) : (
            <Ionicons name="camera-outline" size={30} color="gray" />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Đặt tên nhóm"
          placeholderTextColor="gray"
          style={styles.groupNameInput}
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      {/* Search Input */}
      <TextInput
        placeholder="Tìm số tài khoản"
        placeholderTextColor="gray"
        style={styles.searchInput}
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text); // Cập nhật giá trị input
          handleSearchPhone(text); // Gọi hàm tìm kiếm
        }}
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        <Text style={[styles.tab, styles.activeTab]}>GẦN ĐÂY</Text>
        <Text style={styles.tab}>ĐÃ CHỌN</Text>
      </View>

      {/* Contact List */}
      <View style={styles.content}>
        {/* Contact List */}
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContactItem}
          contentContainerStyle={styles.contactList}
          style={styles.contactListContainer}
        />

        {/* Selected Contacts */}
        <FlatList
          data={selectedContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderSelectedContactItem}
          contentContainerStyle={styles.selectedContactList}
          style={styles.selectedContactContainer}
        />
      </View>

      {selectedContacts.length >= 3 && (
        <TouchableOpacity
          style={styles.createGroupButton}
          onPress={handleCreateGroup}
        >
          <Text style={styles.createGroupButtonText}>Tạo Group</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 15,
  },
  headerTitle: {
    flex: 1,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  selectedCount: {
    color: "white",
    fontSize: 14,
  },
  groupNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
  },
  groupNameInput: {
    flex: 1,
    marginLeft: 10,
    color: "black",
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    margin: 15,
    borderRadius: 5,
    color: "black",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  contactListContainer: {
    flex: 2, // Chiếm 2/3 màn hình
  },
  selectedContactContainer: {
    flex: 1, // Chiếm 1/3 màn hình
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 1,
    borderLeftColor: "#ccc",
  },
  contactList: {
    padding: 15,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  lastActive: {
    color: "#666",
    fontSize: 14,
  },
  selectedContactList: {
    padding: 10,
  },
  selectedContactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedContactName: {
    color: "black",
    fontSize: 14,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tab: {
    paddingVertical: 10,
    color: "#666",
    fontSize: 16,
  },
  activeTab: {
    color: "#007bff",
    borderBottomWidth: 2,
    borderBottomColor: "#007bff",
  },
  selectedContactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Đẩy nút xóa sang bên phải
    marginBottom: 10,
  },
  createGroupButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
  },
  createGroupButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  avatarPicker: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  groupAvatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});

export default CreateGroupTab;
