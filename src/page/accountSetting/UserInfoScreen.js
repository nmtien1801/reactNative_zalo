import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Avatar, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome';
import { updateAvatarService } from "../../service/authService";
import { updateAvatar } from "../../redux/authSlice";
import { launchImageLibrary } from 'react-native-image-picker';


const UserInfoScreen = ({ navigation }) => {

  const user = useSelector((state) => state.auth.user);
  const [avatar, setAvatar] = useState(user?.avatar || "https://i.imgur.com/cIRFqAL.png");
  const [isUploading, setIsUploading] = useState(false);
  const dispatch = useDispatch();


  const handleUploadAvatar = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: "photo",
        includeBase64: false,
      });
  
      if (result.didCancel) return;
      if (result.errorCode) {
        alert("Lỗi: " + result.errorMessage);
        return;
      }
  
      const file = result.assets?.[0];
      if (!file) {
        alert("Không tìm thấy ảnh");
        return;
      }
  
      // Tạo FormData đặc biệt cho React Native
      const formData = new FormData();
      formData.append("avatar", {
        uri: file.uri,
        name: file.fileName || `avatar_${Date.now()}.jpg`,
        type: file.type || 'image/jpeg',
      });
  
      // Debug: Kiểm tra FormData trước khi gửi
      console.log("FormData content:", {
        uri: file.uri,
        name: file.fileName,
        type: file.type,
      });
  
      setIsUploading(true);
      
      // Gửi request với config đặc biệt
      const response = await updateAvatarService(formData);
      
      if (response.EC === 0) {
        const newAvatarUrl = response.DT.avatar;
        dispatch(updateAvatar(newAvatarUrl));
        setAvatar(newAvatarUrl);
        alert("Cập nhật avatar thành công!");
      } else {
        alert(response.EM || "Lỗi khi cập nhật avatar.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Lỗi upload: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={22} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Cover image */}
      <Image
        source={{
          uri: 'https://cover-talk.zadn.vn/8/4/5/f/12/0e029b40ab888036e163cd19734fe529.jpg',
        }}
        style={styles.coverImage}
      />

      {/* Avatar + Username */}
      <View style={styles.avatarSection}>
  <View style={styles.avatarWrapper}>
    <Avatar.Image size={100} source={{ uri: avatar }} />

    {/* Icon camera góc dưới trái */}
    <TouchableOpacity style={styles.editIcon} onPress={handleUploadAvatar}>
      <Icon name="camera" size={16} color="#000" />
    </TouchableOpacity>

  
  </View>

  <Text style={styles.username}>{user?.username}</Text>
</View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Điện thoại</Text>
          <Text style={styles.infoValue}>+84 {user?.phone}</Text>
          <Text style={styles.infoNote}>Chỉ bạn bè có lưu số mới thấy được</Text>
        </View>

        <Button icon="pencil" mode="outlined" style={styles.updateButton}>
          Cập nhật
        </Button>
      </View>
    </ScrollView>
  );
};

export default UserInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  coverImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 20,
  },
 
  username: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  
  avatarWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
  
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: '#fafafa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  infoValue: {
    color: '#555',
    marginTop: 4,
  },
  infoNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  updateButton: {
    marginTop: 20,
  },
});
