import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet,
  TouchableOpacity, Modal, TextInput, Alert
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  getFriendRequestByFromUserAndToUserService,
  sendRequestFriendService
} from '../../service/friendRequestService';
import {
  checkFriendShipExistsService,
  
} from '../../service/friendShipService';

import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user, socketRef, onlineUsers } = route.params || {};
  const [isFriend, setIsFriend] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [friendRequestContent, setFriendRequestContent] = useState('');
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const idUser = user?._id;

  useEffect(() => {
    const init = async () => {
      try {
 
        setCurrentUserId(idUser);

        // Kiểm tra đã là bạn bè chưa
        const res = await checkFriendShipExistsService(idUser);
        setIsFriend(res?.EC === 0);

        // Kiểm tra đã gửi lời mời kết bạn chưa
        const reqRes = await getFriendRequestByFromUserAndToUserService(idUser);
        setHasSentRequest(reqRes?.EC === 0);
      } catch (err) {
        setHasSentRequest(false); // Nếu lỗi thì giả định là chưa gửi
      }
    };

    if (user?._id) {
      init();
    }
  }, [user]);

  const onChatPress = () => {
    navigation.navigate("InboxScreen", {
      item: { ...user },
      socketRef,
      onlineUsers,
    });
  };

  const handleSendFriendRequest = async () => {
    try {
      const response = await sendRequestFriendService({
        toUser: idUser,
        content: friendRequestContent,
      });

      if (response?.data?.EC === 0) {
        Alert.alert("Thành công", "Yêu cầu kết bạn đã được gửi.");
        setHasSentRequest(true);
        setIsFriend(false);
      } else {
        Alert.alert("Thông báo", response?.data?.EM || "Đã xảy ra lỗi.");
      }

      setModalVisible(false);
      setFriendRequestContent('');
    } catch (error) {
      console.error("Lỗi gửi yêu cầu kết bạn:", error);
      Alert.alert("Lỗi", "Không thể gửi yêu cầu kết bạn.");
    }
  };

  const handleCancelRequest = () => {
    Alert.alert("Chức năng đang phát triển", "Tính năng huỷ yêu cầu kết bạn sẽ sớm có!");
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e' }}
        style={styles.coverPhoto}
        resizeMode="cover"
      />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.avatarContainer}>
        <Image
          source={user?.avatar ? { uri: user.avatar } : { uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
          style={styles.avatar}
        />
      </View>

      <View style={styles.nameContainer}>
        <Text style={styles.nameText}>{user?.username || "Không có tên"}</Text>
        <MaterialIcons name="edit" size={20} color="white" style={styles.editIcon} />
      </View>

      <Text style={styles.infoText}>
        You can't view {user?.username || "Không có tên"}'s timeline posts since you're not friends
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.chatButton} onPress={onChatPress}>
          <MaterialIcons name="chat" size={20} color="white" />
          <Text style={styles.chatText}>Chat</Text>
        </TouchableOpacity>

        {!isFriend && (
          <TouchableOpacity
            style={styles.addFriendButton}
            onPress={hasSentRequest ? handleCancelRequest : () => setModalVisible(true)}
          >
            <MaterialIcons
              name={hasSentRequest ? "person-remove" : "person-add"}
              size={20}
              color="black"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Modal nhập nội dung lời mời kết bạn */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nhập lời nhắn</Text>
            <TextInput
              placeholder="Nhập nội dung lời mời kết bạn..."
              placeholderTextColor="#888"
              value={friendRequestContent}
              onChangeText={setFriendRequestContent}
              style={styles.input}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleSendFriendRequest}>
                <Text style={styles.modalButtonText}>Gửi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Huỷ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles giữ nguyên như trước, nếu cần mình có thể gọn lại.



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center' },
  coverPhoto: { width: '100%', height: 200 },
  backButton: {
    position: 'absolute', top: 40, left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 30, zIndex: 10,
  },
  avatarContainer: {
    position: 'absolute', top: 140, borderRadius: 999, borderWidth: 4, borderColor: 'black',
  },
  avatar: { width: 100, height: 100, borderRadius: 999 },
  nameContainer: { marginTop: 60, flexDirection: 'row', alignItems: 'center' },
  nameText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  editIcon: { marginLeft: 8 },
  infoText: {
    marginTop: 10, color: '#bbb', textAlign: 'center', paddingHorizontal: 30,
  },
  buttonContainer: { marginTop: 20, flexDirection: 'row', gap: 10 },
  chatButton: {
    flexDirection: 'row', backgroundColor: '#003366',
    paddingVertical: 10, paddingHorizontal: 25,
    borderRadius: 20, alignItems: 'center', gap: 6,
  },
  chatText: { color: 'white', fontSize: 16, marginLeft: 5 },
  addFriendButton: {
    backgroundColor: 'white', padding: 10, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContainer: {
    width: '85%', backgroundColor: 'white',
    borderRadius: 10, padding: 20,
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 10,
  },
  input: {
    height: 100, borderColor: '#ccc', borderWidth: 1,
    padding: 10, borderRadius: 6, textAlignVertical: 'top',
    color: '#000',
  },
  modalButtons: {
    flexDirection: 'row', justifyContent: 'flex-end', marginTop: 15, gap: 10,
  },
  modalButton: {
    backgroundColor: '#003366', paddingVertical: 8, paddingHorizontal: 15,
    borderRadius: 5,
  },
  modalCancel: {
    backgroundColor: '#888', paddingVertical: 8, paddingHorizontal: 15,
    borderRadius: 5,
  },
  modalButtonText: { color: '#fff' },
});

export default UserProfileScreen;
