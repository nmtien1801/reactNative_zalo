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
} from "react-native";
import { Platform } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { useNavigation } from "@react-navigation/native";

const InformationAccount = ({route}) => {
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
  //   console.log(user);

  useEffect(() => {
    if (user.avatar) {
      setAvatarUrl(user.avatar);
    }
  }, [user.avatar]);

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
        setAvatarUrl(res.DT); // link ảnh server trả về
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
    };

    let res = await dispatch(uploadProfile(data));
    if (res.payload.EC === 0) {
      socketRef.current.emit("REQ_UPDATE_AVATAR");
      navigation.goBack();
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
            onChangeText={(text) => setUserUpdate({ ...user, username: text })}
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
          <Text style={styles.label}>Số điện thoại:</Text>
          <TextInput
            style={styles.input}
            value={userUpdate.phone}
            placeholder="Nhập số điện thoại"
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
