import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { chatGPT } from "../../redux/chatSlice";
import { Send } from "lucide-react-native";

export default function ChatBot() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const scrollViewRef = useRef();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatbotImage = "https://cdn-icons-png.flaticon.com/512/4712/4712027.png";

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await dispatch(chatGPT(message)).unwrap();
      const reply = res.reply;
      setMessages((prev) => [...prev, { sender: "bot", content: reply }]);
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", content: "Xin lỗi, đã xảy ra lỗi!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEditing = () => {
    if (!loading) sendMessage();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: chatbotImage }} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Trợ lý ảo</Text>
          <Text style={styles.subtitle}>Sẵn sàng hỗ trợ bạn</Text>
        </View>
      </View>

      {/* Chat content */}
      <ScrollView
        style={styles.chatContainer}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageRow,
              msg.sender === "user" ? styles.userMessageRow : styles.botMessageRow,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.sender === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === "user" ? styles.userText : styles.botText,
                ]}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={styles.loadingText}>Đang trả lời...</Text>
          </View>
        )}
      </ScrollView>

      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSubmitEditing}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && { opacity: 0.6 }]}
          onPress={sendMessage}
          disabled={loading}
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    color: "#333",
  },
  subtitle: {
    color: "#888",
    fontSize: 12,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: "row",
  },
  userMessageRow: {
    justifyContent: "flex-end",
  },
  botMessageRow: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 16,
    maxWidth: "75%",
  },
  userBubble: {
    backgroundColor: "#007bff",
  },
  botBubble: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  messageText: {
    fontSize: 14,
  },
  userText: {
    color: "white",
  },
  botText: {
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 20,
  },
  loadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 4,
  },
  loadingText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#555",
  },
});
