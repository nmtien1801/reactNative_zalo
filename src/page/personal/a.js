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

const SERVER_URL = 'http://localhost:8080/api/upload'; // đổi thành IP LAN nếu chạy trên thiết bị thật

const createFormData = (photo) => {
    const data = new FormData();
  
    data.append('avatar', photo.uri);
  
    return data;
  };
export default function PersonalTabs() {
  const personal = [
    {
      id: "1",
      name: "Game Center",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "2",
      name: "Tiện ích đời sống",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "3",
      name: "Tiện ích tài chính",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "4",
      name: "Dịch vụ công",
      avatar: require("../../../assets/favicon.png"),
    },
    {
      id: "5",
      name: "Mini App",
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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  // useEffect(() => {
  //   if (user?.avatar) {
  //     setAvatarUrl(user.avatar);
  //   }
  // }, [user?.avatar]);

  // Hàm chọn ảnh từ thư viện hoặc camera
  const pickImage = async () => {
    launchImageLibrary(
      { mediaType: "photo", includeBase64: false },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
        } else if (response.errorMessage) {
          console.log("ImagePicker Error: ", response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setPhoto(response.assets[0]);
        
        }
      }
    );
    await handleUploadPhoto();
  };

  const handleUploadPhoto = async () => {
      if (!photo) {
        Alert.alert('Chưa chọn ảnh');
        return;
      }
  
      try {
        const formData = createFormData(photo);
  
        const res = await fetch(SERVER_URL, {
          method: 'POST',
          body: formData,
          
        });
  
        // const res = await dispatch(uploadAvatar(formData)).unwrap();
  
        const json = await res.json();
        console.log('Upload thành công:', json);
  
        setUploadedUrl(json.DT); // link ảnh server trả về
        await uploadAvatarProfile(user.phone, json.DT);
        Alert.alert('Upload thành công!', `Link: ${json.url}`);
      } catch (error) {
        console.error('Upload thất bại:', error);
        Alert.alert('Lỗi upload', error.message);
      }
    };


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
