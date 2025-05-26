import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { uploadAvatar } from "../../redux/profileSlice.js";
import { uploadProfile } from "../../redux/profileSlice.js";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";

const InformationAccount = ({ route }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const socketRef = route.params.socketRef;

  const [avatarUrl, setAvatarUrl] = useState("");
  const [photo, setPhoto] = useState(null);
  const [userUpdate, setUserUpdate] = useState({
    username: user.username,
    email: user.email,
    dob: user.dob,
    phone: user.phone,
    gender: user.gender,
  });

  useEffect(() => {
    if (user.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, [user.avatar]);

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
          setAvatarUrl(res.DT); // link ảnh server trả về
        } else {
          console.log(res.EM);
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

  const handleUpdateInfo = async () => {
    let data = {
      ...userUpdate,
      avatar: avatarUrl,
      userId: user._id,
    };

    try {
      let res = await dispatch(uploadProfile(data));
      if (res.payload.EC === 0) {
        socketRef.current.emit("REQ_UPDATE_AVATAR");
        navigation.goBack();
      }
    } catch (error) {
      console.log('er ', error);

    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thông tin tài khoản</Text>
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri:
              avatarUrl ||
              "https://s120-ava-talk.zadn.vn/2/2/d/9/20/120/0e029b40ab888036e163cd19734fe529.jpg",
          }}
          style={styles.avatar}
        />
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.changeAvatarText}>Chỉnh sửa ảnh đại diện</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tên người dùng:</Text>
          <TextInput
            style={styles.input}
            value={userUpdate.username}
            onChangeText={(text) =>
              setUserUpdate({ ...userUpdate, username: text })
            }
            placeholder="Nhập tên người dùng"
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={userUpdate.email}
            placeholder="Nhập email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>số tài khoản:</Text>
          <TextInput
            style={styles.input}
            value={userUpdate.phone}
            placeholder="Nhập số tài khoản"
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày sinh:</Text>
          <TextInput
            style={styles.input}
            value={userUpdate.dob}
            onChangeText={(text) => setUserUpdate({ ...userUpdate, dob: text })}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Giới tính:</Text>
          <TextInput
            style={styles.input}
            value={userUpdate.gender}
            onChangeText={(text) =>
              setUserUpdate({ ...userUpdate, gender: text })
            }
            placeholder="gender"
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => handleUpdateInfo()}
        style={styles.updateButton}
      >
        <Text style={styles.updateButtonText}>Cập nhật</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  changeAvatarText: {
    fontSize: 16,
    color: "#007BFF",
  },
  infoContainer: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: "#555",
    fontWeight: "600",
  },
  value: {
    fontSize: 16,
    color: "#000",
    maxWidth: "60%",
  },
  updateButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default InformationAccount;
