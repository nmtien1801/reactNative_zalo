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
  Dimensions,
  ActivityIndicator
} from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { loadMessages } from "../../redux/chatSlice";
import { useSelector, useDispatch } from "react-redux";
import { uploadAvatar } from "../../redux/profileSlice.js";
import * as DocumentPicker from "expo-document-picker";
import { Platform, Animated } from "react-native";
import ImageViewer from "../../component/ImageViewer";
import {
  recallMessageService,
  deleteMessageForMeService,
  sendReactionService,
  getReactionMessageService,
  markMessageAsReadService,
  markAllMessagesAsReadService 
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
  const flatListLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
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

  // Reaction
  const [reactions, setReactions] = useState({});
  const [reactionPopupPosition, setReactionPopupPosition] = useState({ x: 0, y: 0 });
  const [messageIdForReaction, setMessageIdForReaction] = useState(null);

  //Typing
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeout = useRef(null);

  //Select ReadBy
  const [selectedReadStatus, setSelectedReadStatus] = useState(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  //State phân trang tin nhắn
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [oldestMessageId, setOldestMessageId] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [preventAutoScroll, setPreventAutoScroll] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Ánh xạ Emoji - Text
  const emojiToTextMap = {
    "heart": "Love",
    "thumbs-up": "Like", 
    "laugh": "Haha",
    "sad-cry": "Sad",
    "angry": "Angry",
    "like": "Like" 
  };


  // Ánh xạ Text - Icon (sử dụng FontAwesome5)
  const textToEmojiMap = {
    "Like": "👍",
    "Love": "❤️",
    "Haha": "😂", 
    "Sad": "😢",
    "Angry": "😡",
    "Wow": "😮"
  };

  // share mess
  const [shareModalVisible, setShareModalVisible] = useState(false); // Trạng thái cho modal chia sẻ
  const [selectedConversations, setSelectedConversations] = useState([]); // Lưu các conversation được chọn

  const [reactionModalVisible, setReactionModalVisible] = useState(false);
  const [messageForReaction, setMessageForReaction] = useState(null);

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

  // Hàm xử lý khi người dùng nhấp vào tin nhắn
  const handleMessageClick = (messageId) => {

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();

    if (selectedReadStatus === messageId) {
      setSelectedReadStatus(null); // Bỏ chọn nếu đã chọn
    } else {
      setSelectedReadStatus(messageId); // Chọn tin nhắn mới
    }
  };

  // Lấy phản ứng từng message
  const getReactions = async (messageId) => {
    try {
      const response = await getReactionMessageService(messageId);
      if (response.EC === 0) {
        return response.DT; // Trả về danh sách reaction
      } else {
        console.error("Failed to fetch reactions:", response.EM);
        return [];
      }
    } catch (error) {
      console.error("Error fetching reactions:", error);
      return [];
    }
  };

  // Hàm theo dõi typing
  const handleTyping = (text) => {
    setInput(text);
    
    // Nếu đang có timeout, xóa đi để reset
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    // Gửi sự kiện TYPING nếu đang nhập
    if (text.trim() !== "") {
      // Emit typing event
      if (socketRef.current) {
        const typingData = {
          userId: user._id,
          username: user.username,
          receiver: roomData.receiver,
          // Thêm conversationId để đồng bộ với web
          conversationId: roomData.receiver._id
        };
        
        console.log("Sending typing data from mobile:", typingData);
        socketRef.current.emit("TYPING", typingData);
      }
      
      // Set timeout để dừng typing sau 1.5 giây không nhập
      typingTimeout.current = setTimeout(() => {
        // Emit stop typing
        if (socketRef.current) {
          socketRef.current.emit("STOP_TYPING", {
            userId: user._id,
            receiver: roomData.receiver
          });
        }
      }, 1500);
    } else {
      // Nếu input rỗng, gửi sự kiện dừng typing ngay lập tức
      if (socketRef.current) {
        socketRef.current.emit("STOP_TYPING", {
          userId: user._id,
          receiver: roomData.receiver
        });
      }
    }
  };

  // Hàm render nội dung tin nhắn theo loại
  const renderMessageContent = (msg) => {
    switch (msg.type) {
      case "image":
        if (msg.msg.includes(",")) {
          // Nhiều ảnh
          return (
            <View style={styles.gridContainer}>
              {msg.msg.split(",").map((url, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleImageClick(url.trim())}
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
          );
        } else {
          // Một ảnh
          return (
            <TouchableOpacity
              onPress={() => handleImageClick(msg.msg)}
              style={styles.gridItem}
            >
              <Image
                source={{ uri: msg.msg }}
                style={styles.imageSquare}
                resizeMode="cover"
              />
            </TouchableOpacity>
          );
        }
      case "video":
        return (
          <Video
            source={{ uri: msg.msg }}
            style={styles.videoPlayer}
            useNativeControls={true}
            resizeMode="contain"
            isLooping={false}
          />
        );
      case "file":
        return (
          <TouchableOpacity onPress={() => Linking.openURL(msg.msg)}>
            <Text style={styles.fileLink}>
              🡇 {msg.msg.split("_").pop() || "Tệp đính kèm"}
            </Text>
          </TouchableOpacity>
        );
      case "system":
        return (
          <Text style={
            msg.sender._id === user._id
              ? styles.systemMessageTextUser
              : styles.systemMessageTextFriend}>
            {msg.msg || ""}
          </Text>
        );
      default:
        return (
          <Text style={
            msg.sender._id === user._id
              ? styles.messageTextUser
              : styles.messageTextFriend
          }>
            {msg.msg || ""}
          </Text>
        );
    }
  };

  // Gửi phản ứng
  const handleReactToMessage = (messageId, emojiName) => {
    // Chuyển đổi từ tên emoji sang giá trị text tương ứng
    const emojiText = emojiToTextMap[emojiName];
    if (!emojiText) return;

    // Đóng cả hai modal nếu đang mở
    setModalVisible(false);
    setReactionModalVisible(false);

    const reactionData = {
      messageId,
      userId: user._id,
      username: user.username,
      emoji: emojiText,
      receiver: roomData.receiver
    };

    // Kiểm tra nếu có socket connection thì gửi event
    if (socketRef.current) {
      socketRef.current.emit("REACTION", reactionData);
    }

    // Gọi service với đúng tham số
    // sendReactionService(messageId, user._id, emojiText)
    //   .then((response) => {
    //     if (response.EC === 0) {
    //       console.log("Reaction sent successfully:", response.DT);
          
    //       setReactions((prevReactions) => {
    //         const currentReactions = prevReactions[messageId] || [];
    //         const existingReactionIndex = currentReactions.findIndex(
    //           (reaction) => reaction.emoji === emojiText && reaction.userId === user._id
    //         );

    //         let updatedReactions;
    //         if (existingReactionIndex !== -1) {
    //           // Nếu user đã react, xóa reaction
    //           updatedReactions = [...currentReactions];
    //           updatedReactions.splice(existingReactionIndex, 1);
    //         } else {
    //           // Nếu user chưa react, thêm reaction mới
    //           updatedReactions = [
    //             ...currentReactions,
    //             {
    //               emoji: emojiText,
    //               userId: user._id,
    //               count: 1,
    //             },
    //           ];
    //         }

    //         return {
    //           ...prevReactions,
    //           [messageId]: updatedReactions,
    //         };
    //       });
    //     } else {
    //       console.error("Failed to send reaction:", response.EM);
    //     }
    //   })
    //   .catch((error) => {
    //     console.error("Error sending reaction:", error);
    //   });
  };
  
  //Xử lý vị trí popup Reaction
  const handleShowReactionPopup = (event, messageId) => {
    const { pageX, pageY } = event.nativeEvent;
    
    // Lấy kích thước màn hình
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    
    // Ước lượng kích thước của popup (điều chỉnh theo thiết kế thực tế)
    const popupWidth = 200;  // Chiều rộng ước lượng của popup
    const popupHeight = 50;  // Chiều cao ước lượng của popup
    
    // Tính toán vị trí tốt nhất cho popup
    let x = pageX - 70;  // Vị trí mặc định
    let y = pageY - 60;  // Vị trí mặc định
    
    // Xử lý trường hợp vượt quá bên phải màn hình
    if (x + popupWidth > screenWidth) {
      x = screenWidth - popupWidth - 10;  // 10px padding
    }
    
    // Xử lý trường hợp vượt quá bên trái màn hình
    if (x < 10) {
      x = 10;  // 10px padding
    }
    
    // Xử lý trường hợp vượt quá phía trên
    if (y < 70) {  // 70px là chiều cao của header
      y = pageY + 20;  // Hiển thị bên dưới thay vì phía trên
    }
    
    // Xử lý trường hợp vượt quá phía dưới
    if (y + popupHeight > screenHeight - 70) {  // 70px là chiều cao của input container
      y = pageY - popupHeight - 20;  // Hiển thị phía trên thay vì bên dưới
    }
    
    // Cập nhật vị trí popup và hiển thị
    setReactionPopupPosition({ x, y });
    setMessageIdForReaction(messageId);
    setReactionModalVisible(true);
  };

  // Hàm kiểm tra hiển thị avatar và timestamp
  const checkMessageDisplay = (currentMsg, prevMsg, index) => {
    // Kiểm tra người gửi có giống nhau không
    const isSameSender = prevMsg && prevMsg.sender._id === currentMsg.sender._id;
    
    // Tính khoảng thời gian giữa 2 tin nhắn (> 10 phút = 600000ms)
    const timeDiff = prevMsg 
      ? new Date(currentMsg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() 
      : 0;
    const isLongTimeDiff = timeDiff > 600000; // 10 phút
    
    // Hiển thị avatar khi: tin nhắn đầu tiên, người gửi khác, hoặc khoảng cách > 10p
    const showAvatar = !isSameSender || isLongTimeDiff || index === 0;
    
    // Hiển thị timestamp khi khoảng cách > 10p hoặc là tin nhắn đầu tiên
    const showTimestamp = isLongTimeDiff || index === 0;
    
    // Hiển thị tên người gửi khi: tin nhắn đầu tiên hoặc người gửi khác
    const showSenderName = !isSameSender || index === 0;
    
    return { showAvatar, showTimestamp, showSenderName, isSameSender };
  };

  // Lấy reactions cho tất cả tin nhắn
  useEffect(() => {
    const fetchReactions = async () => {
      const reactionsData = {};
      for (const msg of allMsg) {
        const reactionList = await getReactions(msg._id);
        reactionsData[msg._id] = reactionList;
      }
      setReactions(reactionsData);
    };

    if (allMsg.length > 0) {
      fetchReactions();
    }
  }, [allMsg]);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
      // Sau khi cuộn xuống, ta không cần ngăn auto scroll nữa
      setPreventAutoScroll(false);
      setHasNewMessages(false);
    }
  };

  // handleTypeChat
  useEffect(() => {
    let receiverOnline; // lấy socketId của người nhận từ danh sách onlineUsers
    if (receiver.type === 1) {

      // Reset pagination state
      setPage(1);
      setHasMoreMessages(true);
      setIsInitialLoad(true);
      setPreventAutoScroll(false);

      handleLoadMessages(receiver._id, receiver.type, 1); // Pass page 1 explicitly
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
      handleLoadMessages(receiver._id, receiver.type, 1); // Pass page 1 explicitly

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
      handleLoadMessages(receiver._id, receiver.type, 1); // Pass page 1 explicitly

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

  useEffect(() => {
    if (flatListRef.current && flatListRef.current.measureInWindow) {
      flatListRef.current.measure((x, y, width, height, pageX, pageY) => {
        flatListLayout.current = { x: pageX, y: pageY, width, height };
      });
    }
  }, []);

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

  const handleLoadMessages = async (receiver, type, currentPage = 1) => {

    const limit = 20;

    try {

      // Lưu lại vị trí scroll hiện tại trước khi tải
      let currentScrollPosition = null;
      let contentHeight = null;
      
      if (currentPage > 1 && flatListRef.current) {
        // Ghi lại độ dài nội dung và vị trí cuộn hiện tại
        contentHeight = allMsg.length;
      }

      const res = await dispatch(
        loadMessages({ 
          sender: user._id, 
          receiver: receiver, 
          type: type,
          page: currentPage,
          limit: limit 
        })
      );

      if (res.payload.EC === 0) {

        let newMessages = res.payload.DT;
        const filteredMessages = newMessages.filter(
          (msg) => !msg.memberDel?.includes(user._id)
        );

        if (filteredMessages.length < limit) {
          setHasMoreMessages(false);
        }

        if (currentPage === 1) {
          setAllMsg(filteredMessages);
          if (filteredMessages.length > 0) {
            // Save the oldest message ID for reference
            setOldestMessageId(filteredMessages[0]._id);
          }
        } else {
          // Prepend new messages to existing ones (for pagination)
          // Also avoid duplicates by checking message IDs
          const existingIds = new Set(allMsg.map(msg => msg._id));
          const uniqueNewMessages = filteredMessages.filter(msg => !existingIds.has(msg._id));

          // Lưu chiều cao nội dung hiện tại
          const previousMsgCount = allMsg.length;
          
          setAllMsg(prevMessages => [...uniqueNewMessages, ...prevMessages]);
          
          if (filteredMessages.length > 0) {
            setOldestMessageId(filteredMessages[0]._id);
          }

          // Duy trì vị trí scroll sau khi thêm tin nhắn mới
          setTimeout(() => {
            if (flatListRef.current && uniqueNewMessages.length > 0) {
              // Dùng index của message cũ đầu tiên để định vị scroll
              const oldFirstMsgIndex = uniqueNewMessages.length; 
              flatListRef.current.scrollToIndex({
                index: oldFirstMsgIndex > 0 ? oldFirstMsgIndex - 1 : 0,
                animated: false,
                viewPosition: 0 // 0 là đầu màn hình, 1 là cuối màn hình
              });
            }
          }, 100);
        }
        
        // If we didn't get any new messages but hasMoreMessages is still true
        if (filteredMessages.length === 0 && hasMoreMessages) {
          setHasMoreMessages(false);
        }

        // Chỉ đặt isInitialLoad = false sau lần load đầu tiên
        if (currentPage === 1) {
          setTimeout(() => {
            setIsInitialLoad(false);
          }, 500);
        }
      }

    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleLoadMoreMessages = async () => {
    if (isLoadingMore || !hasMoreMessages) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      await handleLoadMessages(receiver._id, receiver.type, nextPage);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more messages:", error);

      // Nếu có lỗi scrollToIndex (invalid index), bắt và xử lý
      if (error.message && error.message.includes("index out of bounds")) {
        console.log("Handled scroll index error gracefully");
      }
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Thêm vào nơi phù hợp trong component
  const onScrollToIndexFailed = (info) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      // Thử scrollToIndex với index gần đó nhất mà hợp lệ
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: Math.min(info.highestMeasuredFrameIndex, info.index - 1),
          animated: false,
          viewPosition: 0
        });
      }
    });
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

  // Đánh dấu một tin nhắn là đã đọc
  const markMessageAsRead = async (messageId) => {
    try {
      if (messageId) {
        console.log("Marking message as read:", messageId);
        const response = await markMessageAsReadService(messageId, user._id);
        if (response.EC === 0) {
          // Emit socket event
          socketRef.current.emit("MARK_READ", {
            messageId,
            userId: user._id,
            conversationId: roomData.receiver._id
          });
          console.log("Socket MARK_READ", response);
        }
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Đánh dấu tất cả tin nhắn là đã đọc
  const markAllMessagesAsRead = async (conversationId) => {
    try {
      console.log("Marking all messages as read for conversation:", conversationId);
      const response = await markAllMessagesAsReadService(conversationId, user._id);
      if (response.EC === 0) {
        // Emit socket event
        socketRef.current.emit("MARK_ALL_READ", {
          userId: user._id,
          conversationId: conversationId
        });
        console.log("Socket MARK_ALL_READ", response);
      }
    } catch (error) {
      console.error("Error marking all messages as read:", error);
    }
  };

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
        msg = `${previewReply}\n\n${msg}`;
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

          //Nếu đang cuộn lên trên, đánh dấu có tin nhắn mới
          if (showScrollButton) {
            setHasNewMessages(true);
          }
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

      socketRef.current.on("RECEIVED_REACTION", (data) => {
        console.log("Received reaction:", data);
        const { messageId, userId, emoji } = data;
        
        setReactions(prevReactions => {
          const currentReactions = prevReactions[messageId] || [];
          
          const existingReactionIndex = currentReactions.findIndex(
            reaction => String(reaction.userId) === String(userId) && reaction.emoji === emoji
          );
          
          let updatedReactions;
          if (existingReactionIndex !== -1) {
            // Nếu đã tồn tại chính xác emoji này từ user này -> xóa
            updatedReactions = currentReactions.filter((_, index) => 
              index !== existingReactionIndex
            );
          } else {
            // Nếu chưa có emoji này -> thêm mới, không cần xóa emoji khác
            updatedReactions = [
              ...currentReactions,
              {
                userId: userId,
                emoji: emoji,
                count: 1
              }
            ];
          }
          
          return {
            ...prevReactions,
            [messageId]: updatedReactions
          };
        });
      });

      socketRef.current.on("REACTION_ERROR", (data) => {
        console.error("Reaction error:", data.error);
      });

      return () => {
        socketRef.current.off("RECEIVED_MSG");
        socketRef.current.off("RECALL_MSG");
        socketRef.current.off("DELETED_MSG");
        socketRef.current.off("RECEIVED_REACTION");
        socketRef.current.off("REACTION_ERROR");
      };

    }
  }, [roomData.receiver]);
  
  //Trích xuất ID từ object MongoDB
  const extractId = (idObject) => {
    if (!idObject) return null;
    
    // Nếu là object với $oid
    if (idObject.$oid) return idObject.$oid;
    
    // Nếu là string
    if (typeof idObject === 'string') return idObject;
    
    // Nếu là object MongoDB đã chuyển đổi
    if (idObject.toString) return idObject.toString();
    
    return null;
  };

  // Xử lý dữ liệu ReadBy
  const processReadByData = (readBy, currentUserId, members) => {
    if (!readBy || !Array.isArray(readBy) || readBy.length === 0) {
      return { readers: [], count: 0 };
    }
    
    // Lọc bỏ người dùng hiện tại
    const filteredReaders = readBy.filter(readerId => {
      const id1 = extractId(readerId);
      const id2 = extractId(currentUserId);
      return id1 !== id2;
    });

    // Nếu không còn reader nào sau khi lọc
    if (filteredReaders.length === 0) {
      return { readers: [], count: 0 };
    }
    
    // Tìm thông tin chi tiết của người đọc (tối đa 3 người)
    const detailedReaders = filteredReaders
      .slice(0, 3)
      .map(readerId => {
        const id = extractId(readerId);
        const memberInfo = conversations.find(conv => extractId(conv._id) === id);
        return memberInfo || { _id: id, avatar: "https://i.imgur.com/l5HXBdTg.jpg", username: "Unknown" };
      });
    
    return {
      readers: detailedReaders,
      count: filteredReaders.length
    };
  };

  // Đánh dấu đã đọc khi vào phòng chat
  useEffect(() => {
    if (roomData && roomData.receiver && user) {
      // Đánh dấu tất cả tin nhắn trong phòng là đã đọc
      markAllMessagesAsRead(roomData.receiver._id);
    }
  }, [roomData]);

  // Đánh dấu tin nhắn đã đọc khi có tin nhắn mới
  useEffect(() => {
    if (allMsg && allMsg.length > 0) {
      // Tìm tin nhắn chưa đọc từ người khác
      const unreadMessages = allMsg.filter(
        msg => msg.sender._id !== user._id && 
              (!msg.readBy || !msg.readBy.includes(user._id))
      );
      
      // Đánh dấu từng tin nhắn chưa đọc
      unreadMessages.forEach(msg => {
        markMessageAsRead(msg._id);
      });
    }
  }, [allMsg]);

  //Listener typing
  useEffect(() => {
    if (socketRef.current) {
      // Lắng nghe sự kiện USER_TYPING
      socketRef.current.on("USER_TYPING", (data) => {

        console.log("Received USER_TYPING in mobile:", data);
        console.log("Mobile current room:", roomData.receiver._id);

        const { userId, username, conversationId } = data;
        
        // Kiểm tra xem sự kiện typing có thuộc conversation hiện tại không
        if (userId === roomData.receiver._id) {
          console.log(`${username} is typing...`);
          setTypingUsers((prev) => ({
            ...prev,
            [userId]: username
          }));
        }
      });
      
      // Lắng nghe sự kiện USER_STOP_TYPING
      socketRef.current.on("USER_STOP_TYPING", (data) => {
        const { userId, conversationId } = data;
        
        // Chỉ xử lý nếu đúng conversation hiện tại
        if (userId === roomData.receiver._id) {
          console.log(`User ${userId} stopped typing`);
          setTypingUsers((prev) => {
            const newState = { ...prev };
            delete newState[userId];
            return newState;
          });
        }
      });
      
      // Cleanup
      return () => {
        socketRef.current.off("USER_TYPING");
        socketRef.current.off("USER_STOP_TYPING");
        
        // Dừng typing khi rời khỏi màn hình
        if (socketRef.current) {
          socketRef.current.emit("STOP_TYPING", {
            userId: user._id,
            receiver: roomData.receiver
          });
        }
      };
    }
  }, [roomData.receiver]);

  // Socket đã đọc
  useEffect(() => {
    if (socketRef.current) {

      // Xử lý sự kiện tin nhắn đã đọc
      socketRef.current.on("MESSAGE_READ", (data) => {
        // Cập nhật trạng thái đã đọc cho tin nhắn
        setAllMsg((prevMsgs) => 
          prevMsgs.map((msg) => 
            msg._id === data.messageId 
            ? { ...msg, isRead: true, readBy: [...(msg.readBy || []), data.userId] } 
            : msg
          )
        );
      });
      
      // Xử lý sự kiện tất cả tin nhắn đã đọc
      socketRef.current.on("ALL_MESSAGES_READ", (data) => {
        // Cập nhật trạng thái đã đọc cho tất cả tin nhắn từ người dùng cụ thể
        setAllMsg((prevMsgs) => 
          prevMsgs.map((msg) => 
            (msg.sender._id === user._id && msg.receiver._id === data.conversationId)
            ? { 
                ...msg, 
                isRead: true, 
                readBy: [...new Set([...(msg.readBy || []), data.userId])] 
              } 
            : msg
          )
        );
      });

      // Cleanup function
      return () => {
        socketRef.current.off("MESSAGE_READ");
        socketRef.current.off("ALL_MESSAGES_READ");
      };
    }
  }, [socketRef, user, roomData]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

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
        renderItem={({ item, index }) => {

          const prevMsg = index > 0 ? allMsg[index - 1] : null;
          const { showAvatar, showTimestamp, showSenderName, isSameSender } = 
            checkMessageDisplay(item, prevMsg, index);
          
          // Lấy thông tin người gửi
          const senderAvatar = item.sender._id !== user._id ? 
            (item.sender.avatar || "https://i.imgur.com/l5HXBdTg.jpg") :
            null;
          const senderName = item.sender._id !== user._id ? item.sender.name || "User" : null;

          return (
            <View>

          {showTimestamp && (
            <View style={styles.timestampContainer}>
              <Text style={styles.timestampText}>
                {new Date(item.createdAt).toLocaleString('vi-VN', {
                  hour: '2-digit', 
                  minute: '2-digit',
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric'
                })}
              </Text>
            </View>
          )}
          <Animated.View
            style={[
              styles.message,
              item.sender._id === user._id
                ? styles.userMessage
                : styles.friendMessage,
              selectedReadStatus === item._id ? { transform: [{ scale: scaleAnim }] } : {}
            ]}
          >
            {/* Hiển thị avatar và tên người gửi - kiểu giống ảnh mẫu */}
            {item.sender._id !== user._id && showAvatar && (
              <View style={styles.senderInfoContainer}>
                <Image
                  source={{ uri: senderAvatar }}
                  style={styles.avatarCircle}
                />
              </View>
            )}
            
            {/* Nếu không phải tin nhắn đầu và cùng người gửi, hiển thị khoảng trống */}
            {item.sender._id !== user._id && !showAvatar && (
              <View style={styles.avatarPlaceholder} />
            )}

            <View style={styles.messageContentContainer}>

              <View style={[
                styles.messageBubble,
                item.sender._id === user._id ? styles.userBubble : styles.friendBubble
              ]}>

                {item.sender._id !== user._id && showAvatar && (
                  <Text style={styles.senderNameBelow}>{senderName}</Text>
                )}

                {/* Nội dung tin nhắn */}
                <TouchableOpacity
                  onLongPress={() => {
                    setSelectedMessage(item);
                    setModalVisible(true);
                  }}
                  onPress={() => item.sender._id === user._id && handleMessageClick(item._id)}
                  style={styles.messageInner}
                >{renderMessageContent(item)}</TouchableOpacity>

                <TouchableOpacity 
                  style={
                    item.sender._id === user._id
                      ? styles.reactionButtonUser
                      : styles.reactionButtonFriend}
                  onPress={() => {
                    handleReactToMessage(item._id, "heart");
                  }}
                  onLongPress={(event) => {
                    handleShowReactionPopup(event, item._id);
                  }}
                >
                  <FontAwesome5 name="smile" size={18} color="#666" />
                </TouchableOpacity>

              </View>

              {/* Hiển thị reactions khi có */}
              {reactions[item._id] && reactions[item._id].length > 0 && (
                <View style={styles.reactionSummary}>
                  {Object.entries(
                    reactions[item._id].reduce((acc, reaction) => {
                      if (!acc[reaction.emoji]) {
                        acc[reaction.emoji] = 0;
                      }
                      acc[reaction.emoji] += 1;
                      return acc;
                    }, {})
                  ).map(([emoji, count], index) => (
                    <View key={index} style={styles.reactionItem}>
                      <Text style={styles.reactionEmoji}>
                        {textToEmojiMap[emoji] || emoji}
                      </Text>
                      <Text style={styles.reactionCount}>{count}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.messageTimeContainer}>
                {/* Hiển thị thời gian */}
                <Text style={[
                  styles.messageTime,
                  item.sender._id === user._id ? styles.userMessageTime : styles.friendMessageTime
                ]}>
                  {convertTime(item.createdAt)}
                </Text>
                {item.sender._id === user._id && (
                  <View style={styles.readStatusContainer}>
                    {index === allMsg.length - 1 || selectedReadStatus === item._id ? (
                      <>
                        {receiver.type === 2 ? (
                          // Chat nhóm
                          item.readBy && item.readBy.length > 0 ? (
                            <View style={styles.readStatusInner}>
                              {(() => {
                                {/* Hiển thị avatar người đọc */}
                                // Xử lý dữ liệu readBy
                                const { readers, count } = processReadByData(item.readBy, user._id, conversations);
                                
                                return (
                                  <>
                                    {readers.length > 0 ? (
                                      <>
                                        <View style={styles.readAvatarContainer}>
                                          {readers.map((reader, index) => (
                                            <Image 
                                              key={index}
                                              source={{ uri: reader.avatar || "https://i.imgur.com/l5HXBdTg.jpg" }}
                                              style={[
                                                styles.readAvatar,
                                                { marginLeft: index > 0 ? -5 : 0 }
                                              ]}
                                            />
                                          ))}
                                          {count > 3 && (
                                            <View style={styles.readCounter}>
                                              <Text style={styles.readCounterText}>+{count - 3}</Text>
                                            </View>
                                          )}
                                        </View>
                                      </>
                                    ) : (
                                      <Text>
                                        <FontAwesome5 name="check" size={12} color="#666" />
                                      </Text>
                                    )}
                                  </>
                                );
                              })()}
                            </View>
                          ) : (
                            <Text>
                              <FontAwesome5 name="check" size={12} color="#666" />
                            </Text>
                          )
                        ) : (
                          // Chat 1-1
                          item.readBy && item.readBy.some(readerId => 
                            extractId(readerId) === extractId(receiver._id)
                          ) ? (
                            <View style={styles.readStatusInner}>
                              <Image
                                source={{ uri: receiver.avatar || "https://i.imgur.com/l5HXBdTg.jpg" }}
                                style={styles.readAvatarSingle}
                              />
                            </View>
                          ) : (
                            <Text>
                              <FontAwesome5 name="check" size={12} color="#666" />
                            </Text>
                          )
                        )}
                      </>
                    ) : null}
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
          </View>
        )}}
        contentContainerStyle={styles.messagesContainer}
        scrollEventThrottle={16} //Hiệu suất scroll
        onScrollToIndexFailed={onScrollToIndexFailed}
        onContentSizeChange={() => {
          // Chỉ scroll to end nếu là lần load đầu tiên hoặc không đang kéo lên để tải thêm
          if (isInitialLoad && !preventAutoScroll) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }}
        onScroll={({ nativeEvent }) => {
          // Check if user has scrolled to the top
          if (nativeEvent.contentOffset.y <= 0 && !isLoadingMore && hasMoreMessages) {
            setPreventAutoScroll(true); // Ngăn scroll xuống dưới khi đang tải thêm
            handleLoadMoreMessages();
          }

          // Kiểm tra vị trí cuộn để quyết định hiển thị nút scroll to bottom
          const isScrolledUp = 
            nativeEvent.contentOffset.y < 
            nativeEvent.contentSize.height - nativeEvent.layoutMeasurement.height - 200; // 200px là ngưỡng
          
          setShowScrollButton(isScrolledUp);
          
          // Nếu người dùng scroll xuống dưới, bật lại auto scroll
          if (
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - 50
          ) {
            setPreventAutoScroll(false);
            setShowScrollButton(false);
          }
        }}
        inverted={false}
        ListHeaderComponent={() => (
          <View style={styles.loadingHeader}>
            {isLoadingMore ? (
              <ActivityIndicator size="small" color="#007bff" />
            ) : !hasMoreMessages ? (
              <Text style={styles.noMoreMessagesText}>Không còn tin nhắn cũ hơn</Text>
            ) : null}
          </View>
        )}
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
            {Object.values(typingUsers).length > 0 && (
              <View style={styles.typingContainer}>
                <Text style={styles.typingText}>
                  {Object.values(typingUsers).length === 1
                    ? `${Object.values(typingUsers)[0]} đang nhập...`
                    : `${Object.values(typingUsers).length} người đang nhập...`}
                </Text>
              </View>
            )}
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
                onChangeText={(text) => handleTyping(text)}
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

      {/* Popup Reaction */}
      {reactionModalVisible && (
        <View style={StyleSheet.absoluteFill}>
          <TouchableWithoutFeedback onPress={() => setReactionModalVisible(false)}>
            <View style={styles.reactionPopupOverlay}>
              <View 
                style={[
                  styles.reactionPopupContainer,
                  {
                    position: 'absolute',
                    left: reactionPopupPosition.x,
                    top: reactionPopupPosition.y,
                  }
                ]}
              >
                {[
                  {emoji: "❤️", type: "heart"},
                  {emoji: "👍", type: "thumbs-up"},
                  {emoji: "😂", type: "laugh"},
                  {emoji: "😢", type: "sad-cry"},
                  {emoji: "😡", type: "angry"}
                ].map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.reactionEmojiButton}
                    onPress={() => {
                      if (messageIdForReaction) {
                        handleReactToMessage(messageIdForReaction, item.type);
                        setReactionModalVisible(false);
                      }
                    }}
                  >
                    <Text style={styles.reactionEmojiText}>{item.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}

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
                <Text style={styles.messageText} numberOfLines={2}>
                  {selectedMessage.type === "text" ? selectedMessage.msg : "Media content"}
                </Text>
                <Text style={styles.messageTime}>
                  {convertTime(selectedMessage.createdAt)}
                </Text>
              </View>
            )}

            {/* Menu hành động */}
            <View style={styles.menuOptions}>
              {[
                {
                  name: "Trả lời",
                  icon: "reply",
                  action: () => {
                    handleReply(selectedMessage);
                  },
                },
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
              renderItem={({ item }) => {
                const isSelected = selectedConversations.includes(item._id);

                return (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => toggleConversationSelection(item._id)}
                      style={{
                        width: 20,
                        height: 20,
                        borderWidth: 2,
                        borderColor: "#007bff",
                        marginRight: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isSelected ? "#007bff" : "transparent",
                      }}
                    >
                      {isSelected && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: "white",
                            borderRadius: 2,
                          }}
                        />
                      )}
                    </TouchableOpacity>

                    <Image
                      source={{ uri: item.avatar }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        marginRight: 10,
                      }}
                    />
                    <Text style={{ fontSize: 16 }}>{item.username}</Text>
                  </View>
                );
              }}
            />

            {showScrollButton && (
              <TouchableOpacity 
                style={styles.scrollToBottomButton} 
                onPress={scrollToBottom}
              >
                <View style={styles.scrollButtonInner}>
                  <FontAwesome5 name="chevron-down" size={16} color="white" />
                  {hasNewMessages && <View style={styles.newMessageBadge} />}
                </View>
              </TouchableOpacity>
            )}

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
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
    maxWidth: "100%",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  friendMessage: {
    justifyContent: "flex-start",
  },
  messageText: {
    color: "black",
  },
  messageTextUser: {
    color: "white",
    flexDirection: 'row', 
    flexWrap: 'wrap',
    maxWidth: "70%",
    minWidth: "50px", 
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "400",
    lineHeight: "1.5",
  },
  messageTextFriend: {
    color: "black",
    flexDirection: 'row', // Đảm bảo text hiển thị theo chiều ngang
    flexWrap: 'wrap',
    maxWidth: "70%",
    minWidth: "50px", 
    marginRight: 10,
    fontSize: 15,
    fontWeight: "400",
    lineHeight: "1.5",
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

  // Avatar styles
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  
  // Timestamp styles
  timestampContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  timestampText: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    fontSize: 12,
    color: '#666',
  },
  
  // Sender name styles
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: 'bold',
  },
  
  // Message container styles
  messageContentContainer: {
    
  },
  
  // Reaction styles
  reactionSummary: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 2,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 5,
  },
  reactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10,
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: 2,
    color: '#666',
    fontWeight: '500',
  },
  
  // Popup reaction styles
  reactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 15,
  },
  emojiButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  
  // System message style
  systemMessageTextFriend: {
    fontStyle: 'italic',
    color: '#666',
    marginRight: 10,
  },

  systemMessageTextUser: {
    fontStyle: 'italic',
    color: 'white',
    marginLeft: 10,
  },

  senderInfoContainer: {
    marginRight: 8,
    alignItems: 'center',
    width: 40,
    marginBottom: 5,
    height: "100%"
  },

  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    marginTop: 5,
  },

  senderNameBelow: {
    fontSize: 12,
    color: '#5a6981',
    marginTop: 2,
    fontWeight: '400',
    marginBottom: 5,
  },

  messageBubble: {
    borderRadius: 16,
    padding: 10,
    position: 'relative',
    maxWidth: '100%',
    display: 'block'
  },

  userBubble: {
    backgroundColor: '#0084ff',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },

  friendBubble: {
    backgroundColor: '#e4e6eb',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
  },

  messageInner: {
    paddingRight: 5, // để tạo khoảng trống cho nút reaction
  },

  // Style cho nút reaction
  reactionButtonFriend: {
    position: 'absolute',
    bottom: -12,
    right: -5,
    backgroundColor: '#ffffff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    zIndex: 10,
  },

  reactionButtonUser: {
    position: 'absolute',
    bottom: -12,
    left: -5,
    backgroundColor: '#ffffff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    zIndex: 10,
  },

  reactionEmoji: {
    fontSize: 16, 
  },

  // Styles cập nhật cho emoji
  emojiText: {
    fontSize: 24,
  },
  emojiButton: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    margin: 5,
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Style cho thời gian
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  userMessageTime: {
    color: '#a0a0a0',
    alignSelf: 'flex-end',
  },
  friendMessageTime: {
    color: '#666',
    alignSelf: 'flex-start',
  },
  

  // Reaction modal styles
  reactionModalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reactionModalContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reactionEmojiButton: {
    padding: 5,
    marginHorizontal: 2,
  },
  reactionEmojiText: {
    fontSize: 17,
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

  reactionPopupOverlay: {
    flex: 1,
    backgroundColor: 'transparent', // Nền trong suốt
  },
  reactionPopupContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 5,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2000,
  },

  typingContainer: {
    position: 'absolute',
    bottom: 60,
    left: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
    maxWidth: '80%',
  },
  typingText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  messageTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  readAvatarSingle: {
    width: 14, 
    height: 14, 
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#fff',
    marginLeft: 2
  },
  readStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4
  },
  readAvatarContainer: {
    flexDirection: 'row',
    marginLeft: 2,
  },
  readAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#fff',
  },
  readCounter: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 4,
    marginLeft: 2,
    justifyContent: 'center',
  },
  readCounterText: {
    fontSize: 9,
    color: '#555',
  },
  messageContentWrapper: {
    position: 'relative',
  },
  selectedMessage: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)', // Màu nhẹ khi được chọn
  },
  readStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    justifyContent: 'flex-end', // Căn lề bên phải
  },
  readStatusInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readAvatarContainer: {
    flexDirection: 'row',
    marginLeft: 2,
    alignItems: 'center',
  },
  readAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#fff',
  },
  readAvatarSingle: {
    width: 14, 
    height: 14, 
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#fff',
    marginLeft: 2
  },
  readCounter: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    paddingHorizontal: 4,
    marginLeft: 2,
    justifyContent: 'center',
  },
  readCounterText: {
    fontSize: 9,
    color: '#555',
  },

  loadingIndicator: {
    paddingVertical: 10,
  },

  loadingHeader: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMoreMessagesText: {
    color: '#888',
    fontSize: 13,
    fontStyle: 'italic',
    padding: 10,
  },

  scrollToBottomButton: {
    position: 'absolute',
    right: 20,
    bottom: 80, // Đặt phía trên input box
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 100,
  },

  scrollButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InboxScreen;