import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  FlatList,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import SearchHeader from "../../component/Header";
import { uploadAvatar } from "../../redux/profileSlice.js";
import { uploadAvatarProfile } from "../../redux/authSlice.js";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesome } from "@expo/vector-icons";
import { Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import { getConversations } from "../../redux/chatSlice";

export default function PersonalTabs({ route }) {
  const [refreshing, setRefreshing] = useState(false); // reload trang
  const socketRef = route.params.socketRef;
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const conversationRedux = useSelector((state) => state.chat.conversations);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getConversations(user._id));
    socketRef.current.emit("register", user._id);
    setRefreshing(false);
  };

  useEffect(() => {
    dispatch(getConversations(user._id));
  }, []);

  useEffect(() => {
    if (conversationRedux) {
      let _conversations = conversationRedux.map((item) => {
        return {
          _id: item.receiver._id,
          username: item.receiver.username,
          message: item.message,
          time: item.time,
          avatar: item.avatar,
          type: item.type,
          phone: item.receiver.phone,
          members: item.members,
          role: item.role,
          permission: item.receiver.permission,
        };
      });

      setConversations(_conversations);
    }
  }, [conversationRedux]);

  const personal = [
    {
      id: "1",
      name: "Cloud của tôi",
      avatar: require("../../../assets/cloud.jpg"),
    },
    {
      id: "2",
      name: "Tài khoản và bảo mật",
      avatar: require("../../../assets/favicon.png"),
    },
  ];

  const PersonalItem = ({ personal }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(personal)}
    >
      <Image source={personal.avatar} style={styles.itemAvatar} />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemName}>{personal.name}</Text>
      </View>
      <Icon name="chevron-forward-outline" size={18} color="#666" />
    </TouchableOpacity>
  );

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [photo, setPhoto] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (user?.avatar) {
      setUploadedUrl(user.avatar);
    }
  }, [user?.avatar]);

  // Hàm chọn ảnh từ thư viện hoặc camera
  const [previewImages, setPreviewImages] = useState([]);
  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*", // hoặc 'image/*', 'video/*', 'application/pdf'
        copyToCacheDirectory: true,
      });
      if (!result.assets || result.assets.length === 0) return;
      if (result.assets.length > 10) {
        alert("Chỉ được chọn tối đa 10 ảnh.");
        return;
      }
      setPreviewImages(result.assets);
    } catch (err) {
      console.log("Error picking file:", err);
    }
  };

  useEffect(() => {
    if (previewImages) {
      handleUploadMultiple();
    }
  }, [previewImages]);

  const handleUploadMultiple = async () => {
    if (!previewImages || previewImages.length === 0) {
      console.log("Chưa chọn ảnh, video hoặc file");
      return;
    }
    try {
      const listUrlImage = [];
      for (const file of previewImages) {
        const formData = new FormData();
        if (Platform.OS === "android" || Platform.OS === "ios") {
          formData.append("avatar", {
            uri: file.uri,
            name: file.name || "photo.jpg",
            type: file.mimeType || "image/jpeg",
          });
        } else {
          formData.append("avatar", file.uri);
          formData.append("fileName", file.name);
          formData.append("mimeType", file.mimeType);
        }

        const res = await dispatch(uploadAvatar(formData)).unwrap();
        console.log("Upload thành công:", res);
        if (res.EC === 0) {
          listUrlImage.push(res.DT);
          setUploadedUrl(res.DT); // link ảnh server trả về

          let a = await dispatch(
            uploadAvatarProfile({ phone: user.phone, avatar: res.DT })
          );

          if (a.payload.EC === 0) {
            socketRef.current.emit("REQ_UPDATE_AVATAR");
          }
        } else {
          console.log("err : ", res.EM);
        }
      }
      if (listUrlImage.length > 0) {
        const listUrlImageString = listUrlImage.join(", ");
      }
    } catch (error) {
      console.error("Upload thất bại:", error);
      Alert.alert("Lỗi upload", error.message);
    }
  };

  const handleItemPress = (item) => {
    if (item.id === "2") {
      navigation.navigate("InformationAccount");
    } else if (item.id === "1") {
      let cloud = conversations.filter((cloud) => cloud.type === 3);
      console.log("ssssssssssssss ", cloud);

      navigation.navigate("InboxScreen", {
        item: cloud[0],
        socketRef,
        onlineUsers,
        conversations,
      });
    }
  };

  // action socket
  useEffect(() => {
    socketRef.current.on("user-list", (usersList) => {
      setOnlineUsers(usersList);
    });
  }, []);

  return (
    <View style={styles.container}>
      <SearchHeader option={"person"} />
      <FlatList
        ListHeaderComponent={() => (
          <TouchableOpacity style={styles.headerContainer}>
            <View style={styles.profileContainer}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri:
                      uploadedUrl ||
                      "https://s120-ava-talk.zadn.vn/2/2/d/9/20/120/0e029b40ab888036e163cd19734fe529.jpg",
                  }}
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={pickImage}
                >
                  <FontAwesome name="camera" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={styles.userName}>{user?.username || "Lộc lá"}</Text>
            </View>
            <Icon name="swap-horizontal-outline" size={24} color="#2196F3" />
          </TouchableOpacity>
        )}
        data={personal}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PersonalItem personal={item} />}
        style={styles.flatList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  flatList: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    justifyContent: "space-between",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  cameraButton: {
    position: "absolute",
    bottom: -10,
    right: -10,
    backgroundColor: "#999",
    borderRadius: 20,
    padding: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  itemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
