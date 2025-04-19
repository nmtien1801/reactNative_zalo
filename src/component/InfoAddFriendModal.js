import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {
  UserRoundCheck,
  UserX,
  Phone,
  MessageSquareText,
  Users,
  Share2,
  Ban,
  AlertCircle,
  Trash2,
} from "lucide-react-native";

import { getRoomChatByPhoneService } from "../service/roomChatService";
import {
  deleteFriendService,
  checkFriendShipExistsService,
} from "../service/friendShipService";
import {
  acceptFriendRequestService,
  cancelFriendRequestService,
  getFriendRequestByFromUserAndToUserService,
  rejectFriendRequestService,
  sendRequestFriendService,
} from "../service/friendRequestService";

const InfoAddFriendMModal = ({ isOpen, closeModal, user, socketRef }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [friendRequest, setFriendRequest] = useState(null);

  const fetchUserInfo = async () => {
    try {
      const response = await getRoomChatByPhoneService(user?.phone);
      const checkFriendResponse = await checkFriendShipExistsService(user?._id);
      setIsFriend(checkFriendResponse.EC === 0);

      let friendRequest = await getFriendRequestByFromUserAndToUserService(
        user?._id
      );
      if (friendRequest.EC === 0) {
        setFriendRequest(friendRequest.DT);
      }

      setUserInfo(response.DT);

      // action socket
      // add friend
      socketRef.current.on("RES_ADD_FRIEND", async () => {
        friendRequest = await getFriendRequestByFromUserAndToUserService(
          user?._id
        );
        if (friendRequest.EC === 0) {
          setFriendRequest(friendRequest.DT);
        }
      });

      // cancel friend
      socketRef.current.on("RES_CANCEL_FRIEND", async () => {
        setFriendRequest(null);
      });

      // reject friend
      socketRef.current.on("RES_REJECT_FRIEND", async () => {
        setFriendRequest(null);
      });

      // accept friend
      socketRef.current.on("RES_ACCEPT_FRIEND", async () => {
        setIsFriend(true)
      });

      // reject friend
      socketRef.current.on("RES_DELETE_FRIEND", async () => {
        setFriendRequest(null);
        setIsFriend(false)
      });
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUserInfo();
    }
  }, [isOpen]);

  const handleAddFriend = async (userId) => {
    const data = {
      toUser: userId,
      content: "Xin chào! Tôi muốn kết bạn với bạn.",
    };
    const response = await sendRequestFriendService(data);
    Alert.alert(
      response.EC === 0 ? "Thành công" : "Lỗi",
      response.EC === 0 ? "Đã gửi lời mời kết bạn thành công!" : response.EM
    );

    if (response.EC === 0) {
      socketRef.current.emit("REQ_ADD_fRIEND", response.DT);
    }

    closeModal();
  };

  const handleDeleteFriend = async (friendId) => {
    const res = await deleteFriendService(friendId);
    Alert.alert(
      res.EC === 0 ? "Thành công" : "Lỗi",
      res.EC === 0 ? "Xóa bạn bè thành công!" : res.EM
    );
    
    if (res.EC === 0) {
      socketRef.current.emit("REQ_DELETE_FRIEND", res.DT);
    }

    // closeModal();
  };

  const handleCancelFriendRequest = async (requestId) => {
    const res = await cancelFriendRequestService(requestId);
    Alert.alert(
      res.EC === 0 ? "Thành công" : "Lỗi",
      res.EC === 0 ? "Hủy yêu cầu kết bạn thành công!" : res.EM
    );

    if (res.EC === 0) {
      socketRef.current.emit("REQ_CANCEL_FRIEND", res.DT);
    }

    closeModal();
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await acceptFriendRequestService(requestId);
      Alert.alert(
        response.EC === 0 ? "Thành công" : "Lỗi",
        response.EC === 0
          ? "Đã chấp nhận yêu cầu kết bạn thành công!"
          : response.EM
      );

      if (response.EC === 0) {
        socketRef.current.emit("REQ_ACCEPT_fRIEND", response.DT);
      }

      closeModal();
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const response = await rejectFriendRequestService(requestId);
      Alert.alert(
        response.EC === 0 ? "Thành công" : "Lỗi",
        response.EC === 0 ? "Đã từ chối yêu cầu kết bạn!" : response.EM
      );

      if (response.EC === 0) {
        socketRef.current.emit("REQ_REJECT_fRIEND", response.DT);
      }

      closeModal();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlay} onPress={closeModal} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Thông tin tài khoản</Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeBtn}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.profileHeader}>
              <Image
                source={{
                  uri: userInfo?.avatar || "https://picsum.photos/200/300",
                }}
                style={styles.profileBackground}
              />
              <View style={styles.row}>
                <Image
                  source={{
                    uri: userInfo?.avatar || "https://picsum.photos/200/300",
                  }}
                  style={styles.profileImage}
                />
                <Text style={styles.profileName}>
                  {userInfo?.username} <Text style={styles.verified}>✔</Text>
                </Text>
              </View>
              <View style={styles.actions}>
                {isFriend && (
                  <>
                    <ActionButton icon={Phone} label="Gọi điện" />
                    <ActionButton icon={MessageSquareText} label="Nhắn tin" />
                  </>
                )}
                {!isFriend && !friendRequest && (
                  <ActionButton
                    icon={UserRoundCheck}
                    label="Kết bạn"
                    onPress={() => handleAddFriend(userInfo?._id)}
                  />
                )}
                {!isFriend && friendRequest?.fromUser?._id === user?._id && (
                  <>
                    <ActionButton
                      icon={UserX}
                      label="Từ chối"
                      onPress={() => handleRejectRequest(friendRequest._id)}
                    />
                    <ActionButton
                      icon={UserRoundCheck}
                      label="Đồng ý"
                      onPress={() => handleAcceptRequest(friendRequest._id)}
                    />
                  </>
                )}
                {!isFriend && friendRequest?.toUser?._id === user?._id && (
                  <ActionButton
                    icon={UserX}
                    label="Hủy lời mời"
                    onPress={() => handleCancelFriendRequest(friendRequest._id)}
                  />
                )}
              </View>
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
              <InfoItem label="Giới tính" value={userInfo?.gender} />
              <InfoItem label="Ngày sinh" value={userInfo?.dob} />
              <InfoItem label="Điện thoại" value={userInfo?.phone} />
            </View>

            {isFriend && (
              <>
                <View style={styles.photosSection}>
                  <Text style={styles.sectionTitle}>Hình ảnh</Text>
                  <ScrollView horizontal>
                    {[1, 2, 3, 4].map((i) => (
                      <Image
                        key={i}
                        source={{
                          uri: `https://picsum.photos/200/300?random=${i}`,
                        }}
                        style={styles.photo}
                      />
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.footer}>
                  <ActionButton icon={Users} label="Nhóm chung (17)" />
                  <ActionButton icon={Share2} label="Chia sẻ danh thiếp" />
                  <ActionButton icon={Ban} label="Chặn tin nhắn" />
                  <ActionButton icon={AlertCircle} label="Báo xấu" />
                  <ActionButton
                    icon={Trash2}
                    label="Xóa bạn bè"
                    onPress={() => handleDeleteFriend(userInfo?._id)}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const ActionButton = ({ icon: Icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
    <Icon size={18} color="black" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const InfoItem = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
  },
  container: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 20,
    padding: 16,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeBtn: {
    fontSize: 24,
    fontWeight: "bold",
  },
  scrollView: {
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileBackground: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -40,
    paddingHorizontal: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  verified: {
    color: "blue",
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e5e5",
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  actionText: {
    marginLeft: 5,
  },
  infoSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: "500",
  },
  infoValue: {
    color: "#333",
  },
  photosSection: {
    marginTop: 20,
  },
  photo: {
    width: 100,
    height: 100,
    marginRight: 8,
    borderRadius: 10,
  },
  footer: {
    marginTop: 20,
  },
});

export default InfoAddFriendMModal;
