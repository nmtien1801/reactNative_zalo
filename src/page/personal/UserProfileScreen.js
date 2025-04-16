import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { checkFriendShipExistsService } from '../../service/friendShipService'; 

const UserProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const { user, socketRef, onlineUsers } = route.params || {};
  const [isFriend, setIsFriend] = useState(false);
  const idUser = user?._id || null;

  useEffect(() => {

    debugger; // eslint-disable-line no-debugger
    const checkFriend = async () => {
      try {
        const res = await checkFriendShipExistsService(idUser);
        console.log("Check friend response:", res);
        setIsFriend(res?.EC === 0);
      } catch (err) {
        console.error('Lỗi kiểm tra kết bạn:', err);
        setIsFriend(false);
      }
    };

    if (user?._id) {
      checkFriend();
    }
  }, [user]);

  const onChatPress = () => {
    navigation.navigate("InboxScreen", {
      item: { ...user },
      socketRef,
      onlineUsers,
    });
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
          <TouchableOpacity style={styles.addFriendButton} onPress={() => {/* Gửi lời mời */}}>
            <MaterialIcons name="person-add" size={20} color="black" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  coverPhoto: {
    width: '100%',
    height: 200,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 30,
    zIndex: 10,
  },
  avatarContainer: {
    position: 'absolute',
    top: 140,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: 'black',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 999,
  },
  nameContainer: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  editIcon: {
    marginLeft: 8,
  },
  infoText: {
    marginTop: 10,
    color: '#bbb',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  chatButton: {
    flexDirection: 'row',
    backgroundColor: '#003366',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
  },
  chatText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 5,
  },
  addFriendButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserProfileScreen;
