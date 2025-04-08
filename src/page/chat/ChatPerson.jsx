import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Switch,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useSelector } from "react-redux";

export default function ChatPerson(props) {
  const user = useSelector((state) => state.auth.userInfo);
  const receiver = props.roomData.receiver;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showCallScreen, setShowCallScreen] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (props.allMsg) {
      setMessages(props.allMsg);
    }
  }, [props.allMsg]);

  useEffect(() => {
    if (!props.socketRef.current) return;

    const socket = props.socketRef.current;
    socket.on("incoming-call", () => {
      setShowCallScreen(true);
      setIsInitiator(false);
    });

    return () => {
      socket.off("incoming-call");
    };
  }, [props.socketRef]);

  const sendMessage = () => {
    props.handleSendMsg(message);
    setMessage("");
  };

  const handleStartCall = () => {
    setShowCallScreen(true);
    setIsInitiator(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Image source={{ uri: "/placeholder.svg" }} style={styles.avatar} />
        </TouchableOpacity>
        <View>
          <Text style={styles.username}>Võ Trường Khang</Text>
          <Text style={styles.subText}>Hoạt động 2 giờ trước</Text>
        </View>
        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={handleStartCall}>
            <Icon name="phone" size={20} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="video" size={20} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon name="search" size={20} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messageList}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageRow,
              msg.sender._id === user._id && styles.messageRight,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.sender._id === user._id
                  ? styles.myMessage
                  : styles.theirMessage,
              ]}
            >
              <Text>{msg.msg}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputArea}>
        <TouchableOpacity>
          <Icon name="smile" size={24} style={styles.icon} />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn..."
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Icon name="send" size={24} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>

      {/* Call Screen */}
      {showCallScreen && (
        <CallScreen
          show={showCallScreen}
          onHide={() => {
            setShowCallScreen(false);
            setIsInitiator(false);
          }}
          senderId={user._id}
          receiverId={receiver._id}
          callerName={user.username}
          receiverName={receiver.username}
          socketRef={props.socketRef}
          isInitiator={isInitiator}
        />
      )}

      {/* Account Info Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text>Thông tin người dùng ở đây</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
