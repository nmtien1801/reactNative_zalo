import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
  Image,
  Linking,
  CheckBox,
  TouchableWithoutFeedback,
} from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { loadMessages } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import { uploadAvatar } from "../../redux/profileSlice.js";
import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import ImageViewer from "../../component/ImageViewer";
import {
  recallMessageService,
  deleteMessageForMeService,
} from "../../service/chatService";

const InboxScreen = ({ route }) => {
  const [receiver, setReceiver] = useState(route.params?.item || null); // click conversation
  let socketRef = route.params?.socketRef;
  let onlineUsers = route.params?.onlineUsers;
  const [conversations, setConversations] = useState(
    route.params?.conversations || [] // Nhận conversations từ route.params
  );
  const conversationRedux = useSelector((state) => state.chat.conversations);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const [input, setInput] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [photo, setPhoto] = useState(null);
  const video = useRef(null); // quản lý video
  const [roomData, setRoomData] = useState({
    room: null,
    receiver: null,
  });
  const [allMsg, setAllMsg] = useState([]);
  const [role, setRole] = useState(null); // Lưu vai trò của người dùng trong nhóm
  const [showPicker, setShowPicker] = useState(false);
  const ICONS = ["smile", "heart", "thumbs-up", "laugh", "sad-tear"];

  // ImageViewer
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // share mess
  const [shareModalVisible, setShareModalVisible] = useState(false); // Trạng thái cho modal chia sẻ
  const [selectedConversations, setSelectedConversations] = useState([]); // Lưu các conversation được chọn

  const toggleConversationSelection = (conversationId) => {
    setSelectedConversations((prev) =>
      prev.includes(conversationId)
        ? prev.filter((id) => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  const IconPicker = ({ visible, onClose, onPick }) => (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
        onPress={onClose}
        activeOpacity={1}
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 10,
            margin: 50,
            borderRadius: 10,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {ICONS.map((icon, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onPick(icon);
                onClose();
              }}
              style={{ margin: 10 }}
            >
              <FontAwesome5 name={icon} size={24} color="black" />
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  useEffect(() => {
    const role = conversations.find((item) => item._id === receiver._id);
    if (role) {
      setRole(role.role);
    }
  }, [conversations]);

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

  // handleTypeChat
  useEffect(() => {
    let receiverOnline; // lấy socketId của người nhận từ danh sách onlineUsers
    if (receiver.type === 1) {
      handleLoadMessages(receiver._id, receiver.type);
      receiverOnline = onlineUsers.find((u) => u.userId === receiver._id);

      setRoomData({
        ...roomData,
        room: "single",
        receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    } else if (receiver.type === 2) {
      handleLoadMessages(receiver._id, receiver.type);

      receiverOnline = onlineUsers.find((u) =>
        receiver.members?.includes(u.userId)
      );

      setRoomData({
        ...roomData,
        room: "group",
        receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    } else {
      handleLoadMessages(receiver._id, receiver.type);

      receiverOnline = onlineUsers.find((u) => u.userId === receiver._id);
      setRoomData({
        ...roomData,
        room: "cloud",
        receiver: {
          ...receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
      });
    }
  }, []);

  const handleLoadMessages = async (receiver, type) => {
    const res = await dispatch(
      loadMessages({ sender: user._id, receiver: receiver, type: type })
    );

    if (res.payload.EC === 0) {
      let msg = res.payload.DT;
      const filteredMessages = msg.filter(
        (msg) => !msg.memberDel?.includes(user._id)
      );
      setAllMsg(filteredMessages);
    }
  };

  const [mediaMessages, setMediaMessages] = useState([]);
  const [fileMessages, setFileMessages] = useState([]);
  const [linkMessages, setLinkMessages] = useState([]);

  // const [showAllModal, setShowAllModal] = useState(false);
  // const [activeTab, setActiveTab] = useState("media"); // Default tab is "media"

  useEffect(() => {
    const media = allMsg.flatMap((msg) => {
      if (msg.type === "image") {
        // Nếu msg chứa nhiều URL, tách chúng thành mảng
        return msg.msg.split(",").map((url) => ({
          ...msg,
          msg: url.trim(), // Loại bỏ khoảng trắng thừa
        }));
      }
      if (msg.type === "video") {
        return [msg]; // Giữ nguyên video
      }
      return [];
    });

    const files = allMsg.filter((msg) => msg.type === "file");
    const links = allMsg.filter(
      (msg) =>
        msg.type === "text" && // Chỉ lấy tin nhắn có type là "text"
        msg.msg.match(/https?:\/\/[^\s]+/g) // Kiểm tra xem msg có chứa URL
    );

    setMediaMessages(media); // Cập nhật mediaMessages
    setFileMessages(files);
    setLinkMessages(links); // Lưu các tin nhắn dạng URL
  }, [allMsg]);

  const cleanFileName = (fileName) => {
    // Loại bỏ các ký tự hoặc số không cần thiết ở đầu tên file
    return fileName.replace(/^\d+_|^\d+-/, ""); // Loại bỏ số và dấu gạch dưới hoặc gạch ngang ở đầu
  };

  const sendMessage = (message, type) => {
    if (socketRef.current) {
      let sender = { ...user };
      sender.socketId = socketRef.current.id;

      // Lấy socketId của receiver từ danh sách onlineUsers
      const receiverOnline = onlineUsers.find(
        (u) => u.userId === roomData.receiver?._id
      );
      let msg;
      if (typeof message === "string") {
        if (!message.trim()) {
          alert("Tin nhắn không được để trống!");
          return;
        }
        msg = message; // Gán chuỗi như bình thường
      } else if (Array.isArray(message)) {
        if (message.length === 0) {
          alert("Danh sách ảnh/file rỗng!");
          return;
        }
        msg = message; // Gán mảng luôn, không stringify
      } else {
        alert("Dữ liệu không hợp lệ");
        return;
      }
      
      if (previewReply !== "") {
        msg = (`${previewReply}\n\n${msg}`);
        setPreviewReply("");
      }

      const data = {
        msg: msg,
        receiver: {
          ...roomData.receiver,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
        sender,
        type: type, // 1 - text , 2 - image, 3 - video, 4 - file, 5 - icon
      };
      socketRef.current.emit("SEND_MSG", data);
    }

    // gửi cloud
    if (roomData.receiver.type === 3) {
      handleLoadMessages(receiver._id, receiver.type);
    }

    setInput("");
  };

  // Hàm gửi tin nhắn đến các cuộc trò chuyện được chọn
  const handleShareMessage = () => {
    if (!selectedMessage) {
      Alert.alert("Lỗi", "Không có tin nhắn nào được chọn để chia sẻ!");
      return;
    }

    if (selectedConversations.length === 0) {
      Alert.alert(
        "Lỗi",
        "Vui lòng chọn ít nhất một cuộc trò chuyện để chia sẻ!"
      );
      return;
    }

    if (!socketRef.current || !socketRef.current.connected) {
      Alert.alert("Lỗi", "Không thể kết nối đến máy chủ!");
      return;
    }

    // Lặp qua danh sách các cuộc trò chuyện được chọn
    selectedConversations.forEach((conversationId) => {
      const conversation = conversations.find((c) => c._id === conversationId);
      if (!conversation) {
        console.error(
          `Không tìm thấy cuộc trò chuyện với ID: ${conversationId}`
        );
        return;
      }
      const receiverOnline = onlineUsers.find(
        (u) => u.userId === conversation._id
      );
      const data = {
        msg: selectedMessage.msg, // Nội dung tin nhắn
        receiver: {
          ...conversation,
          socketId: receiverOnline ? receiverOnline.socketId : null,
        },
        sender: {
          ...user,
          socketId: socketRef.current.id,
        },
        type: selectedMessage.type, // Kiểu tin nhắn (text, image, video, etc.)
      };

      console.log("Sending data: ", data);

      // Gửi tin nhắn qua socket
      socketRef.current.emit("SEND_MSG", data);
    });

    // Đóng modal sau khi gửi
    setShareModalVisible(false);
    setSelectedConversations([]);
    Alert.alert(
      "Thành công",
      "Tin nhắn đã được chia sẻ đến người nhận online!"
    );
  };

  const convertTime = (time) => {
    const date = new Date(time);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    });
  };

  const createFormData = (photo) => {
    const data = new FormData();
    if (Platform.OS === "android" || Platform.OS === "ios") {
      data.append("avatar", {
        uri: photo[0].uri,
        name: photo[0].name || "photo.jpg",
        type: photo[0].mimeType || "image/jpeg",
      });
    } else {
      data.append("avatar", photo[0].uri);
      data.append("fileName", photo[0].name);
      data.append("mimeType", photo[0].mimeType);
    }
    return data;
  };

  const pickMedia = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["video/*", "application/*"], // hoặc 'image/*', 'video/*', 'application/pdf'
        multiple: false,
        copyToCacheDirectory: true,
      });
      setPhoto(result.assets);
    } catch (err) {
      console.log("Error picking file:", err);
    }
  };

  useEffect(() => {
    if (photo) {
      handleUploadPhoto();
    }
  }, [photo]);

  const handleUploadPhoto = async () => {
    if (!photo) {
      Alert.alert("Chưa chọn ảnh or video");
      return;
    }
    try {
      const formData = createFormData(photo);
      const res = await dispatch(uploadAvatar(formData)).unwrap();

      console.log("Upload thành công:", res);
      if (res.EC === 0) {
        const mimeType = photo[0].mimeType;
        let type;
        if (mimeType.split("/")[0] === "video") {
          type = "video";
        } else if (mimeType.split("/")[0] === "image") {
          type = "image";
        } else if (mimeType.split("/")[0] === "application") {
          type = "file";
        } else {
          type = "text";
        }
        sendMessage(res.DT, type);
      }
    } catch (error) {
      console.error("Upload thất bại:", error);
      Alert.alert("Lỗi upload", error.message);
    }
  };

  const handleSelectIcon = (iconName) => {
    const iconMap = {
      smile: "😄",
      heart: "❤️",
      "thumbs-up": "👍",
      "sad-tear": "😢",
      laugh: "😂",
    };
    const emoji = iconMap[iconName] || "";
    setInput((prev) => prev + emoji);
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("RECEIVED_MSG", (data) => {
        // Kiểm tra xem tin nhắn có thuộc về cuộc trò chuyện hiện tại không
        if (
          data.receiver._id === roomData.receiver?._id ||
          data.sender._id === roomData.receiver?._id
        ) {
          setAllMsg((prevState) => [...prevState, data]);
        }
      });

      socketRef.current.on("RECALL_MSG", (data) => {
        setAllMsg((prevMsgs) =>
          prevMsgs.map((msg) =>
            msg._id === data._id
              ? { ...msg, msg: "Tin nhắn đã được thu hồi", type: "system" }
              : msg
          )
        );
      });
      socketRef.current.on("DELETED_MSG", (data) => {
        setAllMsg((prevState) =>
          prevState.filter((item) => item._id != data.msg._id)
        );
      });
    }
  }, [roomData.receiver]);

  const handleRecallMessage = async (message) => {
    try {
      const response = await recallMessageService(message._id);
      if (response && response.EC === 0) {
        socketRef.current.emit("RECALL", message);
      } else {
        console.error("Thu hồi tin nhắn thất bại:", response.EM);
      }
    } catch (error) {
      console.error("Error recalling message:", error);
    }
  };

  const handleDeleteMessageForMe = async (messageId) => {
    try {
      let member;
      if (receiver.type === 2) {
        member = {
          ...receiver,
          memberDel: user._id,
        };
      } else {
        member = user;
      }

      const response = await deleteMessageForMeService(messageId, member);
      if (response && response.EC === 0) {
        setAllMsg((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== messageId)
        );
      } else {
        Alert.alert("Lỗi", response.EM || "Không thể xóa tin nhắn.");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi xóa tin nhắn.");
    }
  };

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*", // hoặc 'image/*', 'video/*', 'application/pdf'
        multiple: true,
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
        if (res.EC === 0) {
          listUrlImage.push(res.DT);
        } else {
          console.log(res.EM);
        }
      }
      if (listUrlImage.length > 0) {
        const listUrlImageString = listUrlImage.join(", ");
        sendMessage(listUrlImageString, "image");
      }
    } catch (error) {
      console.error("Upload thất bại:", error);
      Alert.alert("Lỗi upload", error.message);
    }
  };

  const forwardMessage = (message) => {
    navigation.navigate("ShareScreen", { message });
  };

  // action socket
  useEffect(() => {
    socketRef.current.on("RES_MEMBER_PERMISSION", (data) => {
      const member = data.find((item) => item.sender._id === user._id);

      setReceiver({
        ...receiver,
        permission: member.receiver.permission,
        role: member.role,
      });
    });

    socketRef.current.on("RES_UPDATE_DEPUTY", (data) => {
      // Nếu không có bản ghi nào được cập nhật
      if (data.length === 0) {
        setRole("member");
        setReceiver({
          ...receiver,
          role: "member",
        });
        return;
      }

      // Tìm xem user có phải là sender hoặc receiver không
      const member = data.find(
        (item) =>
          item?.sender?._id === user._id || item?.receiver?._id === user._id
      );

      if (member) {
        setRole(member.role);
        setReceiver({
          ...receiver,
          permission: member.receiver.permission,
          role: member.role,
        });
      } else {
        if (receiver.role !== "leader") {
          setRole("member");
          setReceiver({
            ...receiver,
            permission: member.receiver.permission,
            role: "member",
          });
        }
      }
    });

    socketRef.current.on("RES_TRANS_LEADER", (data) => {
      const { newLeader, oldLeader } = data;
      let member = null;
      if (newLeader?.sender?._id === user._id) {
        member = newLeader;
      } else if (oldLeader?.sender?._id === user._id) {
        member = oldLeader;
      }

      if (member) {
        setRole(member.role);
        setReceiver({
          ...receiver,
          role: member.role,
        });
      } else {
        setRole("member");
        setReceiver({
          ...receiver,
          role: "member",
        });
      }
    });

    socketRef.current.on("RES_REMOVE_MEMBER", (data) => {
      if (receiver.role !== "leader" && data.member === user._id) {
        navigation.navigate("MainTabs", {
          socketRef,
        });
      }
    });
  }, [conversations]);

  // Hàm nhấp vào image xem
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseImageViewer = () => {
    setSelectedImage(null);
  };

  const convertTimeAction = (time) => {
    const now = Date.now();
    const past = Number(time);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (seconds < 60) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days === 1) return "Hôm qua";

    const date = new Date(past);
    return date.toLocaleDateString("vi-VN");
  };

  // reply mess
  let [previewReply, setPreviewReply] = useState("");
  const handleReply = async (selectedMessage) => {
    // Tách nội dung từ dòng 2 trở đi (nếu có \n)
    const parts = selectedMessage.msg.split("\n\n");
    const contentAfterFirstLine =
      parts.length > 1 ? parts.slice(1).join("\n") : selectedMessage.msg;

   setPreviewReply(selectedMessage.sender.name + ": " + contentAfterFirstLine);
  };

  const handleClearReply = async () => {
    setPreviewReply("");
  };

  // call
  const handleStartCall = route.params?.handleStartCall;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("MainTabs")}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerText}>{receiver.username}</Text>
            <Text style={styles.activeText}>
              {receiver.type === 3
                ? "Lưu và đồng bộ dữ liệu giữa các thiết bị"
                : `Hoạt động ${convertTimeAction(receiver.time)}`}
            </Text>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => handleStartCall(user, receiver)}>
            <Ionicons name="call" size={23} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="videocam" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate(
                receiver.type === 2 ? "GroupOption" : "PersonOption",
                {
                  receiver,
                  socketRef,
                  onlineUsers,
                  conversations,
                  role,
                  mediaMessages, // Truyền mediaMessages
                  fileMessages, // Truyền fileMessages
                  linkMessages, // Truyền linkMessages
                }
              )
            }
          >
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={allMsg}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.message,
              item.sender._id === user._id
                ? styles.userMessage
                : styles.friendMessage,
            ]}
          >
            {item.type === "image" ? (
              item.msg.includes(",") ? (
                // Nếu có nhiều ảnh, tách và hiển thị dạng lưới
                <View style={styles.gridContainer}>
                  {item.msg.split(",").map((url, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleImageClick(url.trim())}
                      onLongPress={() => {
                        setSelectedMessage(item);
                        setModalVisible(true);
                      }}
                      style={styles.gridItem}
                    >
                      <Image
                        source={{ uri: url.trim() }}
                        style={styles.imageSquare}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                // Nếu chỉ có một ảnh
                <TouchableOpacity
                  onPress={() => handleImageClick(item.msg)}
                  onLongPress={() => {
                    setSelectedMessage(item);
                    setModalVisible(true);
                  }}
                  style={styles.gridItem}
                >
                  <Image
                    source={{ uri: item.msg }}
                    style={styles.imageSquare}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )
            ) : item.type === "video" ? (
              <TouchableOpacity
                onLongPress={() => {
                  setSelectedMessage(item);
                  setModalVisible(true);
                }}
              >
                <Video
                  source={{ uri: item.msg }}
                  style={{
                    width: 250,
                    height: 200,
                    borderRadius: 10,
                    backgroundColor: "black",
                  }}
                  useNativeControls={true}
                  resizeMode="contain"
                  isLooping={false}
                />
              </TouchableOpacity>
            ) : item.type === "file" ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(item.msg)}
                onLongPress={() => {
                  setSelectedMessage(item);
                  setModalVisible(true);
                }}
              >
                <Text
                  style={{
                    color: "white",
                    backgroundColor: "#007bff",
                    padding: 8,
                    borderRadius: 10,
                  }}
                >
                  🡇 {item.msg.split("_").pop() || "Tệp đính kèm"}
                </Text>
              </TouchableOpacity>
            ) : item.type === "system" ? (
              <TouchableOpacity>
                <Text
                  style={[
                    item.sender._id === user._id
                      ? styles.messageTextUser
                      : styles.messageTextFriend,
                    styles.italicText,
                  ]}
                >
                  {item.msg || ""}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onLongPress={() => {
                  setSelectedMessage(item);
                  setModalVisible(true);
                }}
              >
                <Text
                  style={
                    item.sender._id === user._id
                      ? styles.messageTextUser
                      : styles.messageTextFriend
                  }
                >
                  {(item.msg || "").replace(/\\n/g, "\n")}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.messageTime}>
              {convertTime(item.createdAt)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100); // thử 100ms hoặc tăng lên 200ms nếu cần
        }}
      />

      {/* Input Box */}
      <View style={styles.inputContainer}>
        {receiver.permission.includes(3) ||
        role === "leader" ||
        role === "deputy" ? (
          <>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => setShowPicker(true)}
            >
              <FontAwesome5 name="sticky-note" size={24} color="black" />
              <FontAwesome5
                name="smile"
                size={12}
                color="black"
                style={{ marginLeft: -17 }}
              />
            </TouchableOpacity>
            <View style={styles.inputWrapper}>
              {previewReply !== "" && (
                <View style={styles.replyPreviewContainer}>
                  <Text style={styles.replyPreviewText} numberOfLines={2}>
                     {previewReply}
                  </Text>
                  <TouchableOpacity onPress={() => handleClearReply()}>
                    <FontAwesome5 name="times-circle" size={16} color="red" />
                  </TouchableOpacity>
                </View>
              )}
              <TextInput
                style={styles.input}
                placeholder="Message"
                placeholderTextColor="grey"
                value={input}
                onChangeText={(text) => setInput(text)}
              />
            </View>
            {!input.trim() ? (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={styles.iconWrapper}
                  onPress={pickMedia}
                >
                  <FontAwesome5 name="paperclip" size={22} color="gray" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconWrapper}
                  onPress={pickImage}
                >
                  <FontAwesome5 name="image" size={22} color="gray" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.iconWrapper}
                onPress={() => sendMessage(input, "text")}
              >
                <FontAwesome5 name="paper-plane" size={22} color="blue" />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text>Chỉ có trưởng nhóm/ phó nhóm mới được phép nhắn tin</Text>
        )}
      </View>

      <IconPicker
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onPick={(iconName) => handleSelectIcon(iconName)}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            {/* Tin nhắn được chọn */}
            {selectedMessage && (
              <View style={styles.highlightedMessage}>
                <Text style={styles.messageText}>{selectedMessage.msg}</Text>
                <Text style={styles.messageTime}>
                  {convertTime(selectedMessage.createdAt)}
                </Text>
              </View>
            )}

            {/* Biểu tượng cảm xúc */}
            <View style={styles.reactionBar}>
              {["heart", "thumbs-up", "laugh", "sad-cry", "angry"].map(
                (icon, index) => (
                  <TouchableOpacity key={index} style={styles.emojiButton}>
                    <FontAwesome5 name={icon} size={24} color="red" />
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Menu hành động */}
            <View style={styles.menuOptions}>
              {[
                { name: "Trả lời", icon: "reply", action: () => {
                  handleReply(selectedMessage)
                } },
                {
                  name: "Chuyển tiếp",
                  icon: "share",
                  action: () => {
                    setModalVisible(false); // Đóng modal sau khi chia sẻ
                    setShareModalVisible(true); // Mở modal chia sẻ
                  },
                },
                ...(selectedMessage?.sender._id === user._id &&
                (new Date() - new Date(selectedMessage.createdAt)) /
                  (1000 * 60 * 60) <
                  1
                  ? [
                      {
                        name: "Thu hồi",
                        icon: "undo",
                        action: () => {
                          handleRecallMessage(selectedMessage);
                          setModalVisible(false);
                        },
                      },
                    ]
                  : []),
                {
                  name: "Xóa ở phía tôi",
                  icon: "trash",
                  action: () => {
                    handleDeleteMessageForMe(selectedMessage._id, user._id);
                    setModalVisible(false);
                  },
                },
                {
                  name: "Xóa",
                  icon: "trash",
                  action: () =>
                    handleDeleteMessageForMe(selectedMessage._id, user._id),
                },
              ].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.action}
                >
                  <FontAwesome5 name={item.icon} size={25} color="black" />
                  <Text style={styles.menuText}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal chia sẻ */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setShareModalVisible(false)}
              style={{ alignSelf: "flex-end", padding: 5 }}
            >
              <Text style={{ color: "blue" }}>Đóng</Text>
            </TouchableOpacity>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Chọn cuộc trò chuyện để chia sẻ
            </Text>
            <FlatList
              data={conversations}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <CheckBox
                    value={selectedConversations.includes(item._id)}
                    onValueChange={() => toggleConversationSelection(item._id)}
                  />
                  <Image
                    source={item.avatar}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      marginRight: 10,
                    }}
                  />
                  <Text style={{ fontSize: 16 }}>{item.username}</Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={{
                backgroundColor: "#007bff",
                padding: 10,
                borderRadius: 5,
                marginTop: 10,
              }}
              onPress={handleShareMessage}
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                Chuyển tiếp
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {selectedImage && (
        <ImageViewer
          imageUrl={selectedImage}
          onClose={handleCloseImageViewer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#007bff",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 10,
    zIndex: 1000,
    elevation: 5,
  },
  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  activeText: {
    fontSize: 12,
    color: "white",
  },
  iconButton: {
    padding: 5,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 20,
  },
  messagesContainer: {
    paddingTop: 70,
    paddingBottom: 70,
    paddingLeft: 10,
    paddingRight: 10,
  },
  message: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  friendMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    color: "black",
  },
  messageTextUser: {
    color: "white",
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 10,
  },
  messageTextFriend: {
    color: "black",
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 10,
  },
  messageTime: {
    fontSize: 10,
    color: "gray",
    textAlign: "right",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ccc",
    gap: 15,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "black",
  },
  iconWrapper: {
    paddingHorizontal: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
    elevation: 10,
  },
  highlightedMessage: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "90%",
    alignSelf: "center",
    marginBottom: 10,
  },
  reactionBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  emojiButton: {
    padding: 8,
  },
  menuOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  menuItem: {
    alignItems: "center",
    padding: 10,
    width: "30%",
  },
  menuText: {
    color: "black",
    fontSize: 14,
    marginTop: 5,
  },
  italicText: {
    fontStyle: "italic",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 10,
  },
  gridItem: {
    width: 100,
    height: 100,
    margin: 5,
  },
  imageSquare: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    backgroundColor: "transparent",
  },
  replyPreviewContainer: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#f0f0f0",
  borderRadius: 8,
  padding: 6,
  marginBottom: 4,
  marginHorizontal: 8,
},

replyPreviewText: {
  flex: 1,
  color: "#555",
  fontStyle: "italic",
  fontSize: 13,
  marginRight: 8,
},
});

export default InboxScreen;
