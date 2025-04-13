import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import SearchHeader from "../../component/Header";
import { uploadAvatar } from "../../redux/profileSlice.js";
import { uploadAvatarProfile } from "../../redux/authSlice.js";
import { useSelector, useDispatch } from "react-redux";
import { launchImageLibrary } from "react-native-image-picker"; // Import đúng cách
import { FontAwesome } from "@expo/vector-icons";

const createFormData = (photo) => {
  const data = new FormData();

  data.append("avatar", photo.uri);

  return data;
};
export default function PersonalTabs() {
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
    <TouchableOpacity style={styles.itemContainer}>
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

  useEffect(() => {
    if (user?.avatar) {
      setUploadedUrl(user.avatar);
    }
  }, [user?.avatar]);

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
    handleUploadPhoto();
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
          uploadAvatarProfile({ phone: user.phone, avatar: res.DT })
        );
        console.log("a sac", a);
        if (a.payload.EC === 0) {
          Alert.alert("Upload thành công!", `Link: ${res.DT}`);
        }
      }
    } catch (error) {
      console.error("Upload thất bại:", error);
      Alert.alert("Lỗi upload", error.message);
    }
  };
  console.log(user);

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
              <Text style={styles.userName}>{user?.name || "Lộc lá"}</Text>
            </View>
            <Icon name="swap-horizontal-outline" size={24} color="#2196F3" />
          </TouchableOpacity>
        )}
        data={personal}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PersonalItem personal={item} />}
        style={styles.flatList}
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
