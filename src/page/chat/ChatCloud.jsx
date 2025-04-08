import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSelector, useDispatch } from 'react-redux';

export default function ChatCloud({ allMsg, handleSendMsg }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.userInfo);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const sections = [
    { id: 'media', title: 'Ảnh/Video', icon: 'image' },
    { id: 'files', title: 'File', icon: 'file' },
    { id: 'links', title: 'Link', icon: 'link' },
  ];

  useEffect(() => {
    if (allMsg) {
      setMessages(allMsg);
    }
  }, [allMsg]);

  const sendMessage = () => {
    handleSendMsg(message);
    setMessage('');
  };

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {/* Chat Area */}
      <View style={styles.chatContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsOpen(true)}>
            <Image source={require('../../../assets/icon.png')} style={styles.avatar} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Cloud của tôi</Text>
            <Text style={styles.headerSub}>Lưu và đồng bộ dữ liệu giữa các thiết bị</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <Icon name="search" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowSidebar(!showSidebar)}>
              <Icon name="layout" size={20} color="#0d6efd" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView style={styles.messages}>
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
                    ? styles.bubblePrimary
                    : styles.bubbleWhite,
                ]}
              >
                <Text style={msg.sender._id === user._id && { color: '#fff' }}>
                  {msg.msg}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="smile" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="paperclip" size={20} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Nhập tin nhắn..."
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sidebar */}
      {showSidebar && (
        <ScrollView style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Thông tin hội thoại</Text>
          </View>

          <View style={styles.profile}>
            <Image source={require('../../../assets/icon.png')} style={styles.profileImage} />
            <Text style={styles.profileName}>Cloud của tôi</Text>
            <Text style={styles.profileDesc}>
              Lưu trữ và truy cập nhanh những nội dung quan trọng của bạn ngay trên zalo
            </Text>
          </View>

          <TouchableOpacity style={styles.sidebarOption}>
            <Icon name="clock" size={20} color="#999" />
            <Text style={styles.optionText}>Danh sách nhắc hẹn</Text>
          </TouchableOpacity>

          {sections.map(({ id, title, icon }) => (
            <View key={id} style={styles.sectionItem}>
              <View style={styles.sectionHeader}>
                <Icon name={icon} size={20} />
                <Text style={styles.sectionTitle}>{title}</Text>
              </View>
              <Text style={styles.sectionEmpty}>
                Chưa có {title} được chia sẻ trong hội thoại này
              </Text>
            </View>
          ))}

          <View style={styles.sectionItem}>
            <View style={styles.sectionHeader}>
              <Icon name="shield" size={20} />
              <Text style={styles.sectionTitle}>Thiết lập bảo mật</Text>
            </View>
            <View style={styles.sectionContent}>
              <View style={styles.toggleRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="eye-off" size={20} color="#999" />
                  <Text style={styles.optionText}>Ẩn trò chuyện</Text>
                </View>
                <Switch />
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chatContainer: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'space-between',
  },
  headerText: { flex: 1, marginLeft: 10 },
  headerTitle: { fontWeight: '600' },
  headerSub: { fontSize: 12, color: '#888' },
  headerIcons: { flexDirection: 'row' },
  iconButton: { marginHorizontal: 5 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  messages: { flex: 1, padding: 10 },
  messageRow: { flexDirection: 'row', marginBottom: 8 },
  messageRight: { justifyContent: 'flex-end' },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    maxWidth: '75%',
  },
  bubblePrimary: { backgroundColor: '#0d6efd' },
  bubbleWhite: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    marginHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#0d6efd',
    borderRadius: 20,
    padding: 10,
  },
  sidebar: {
    width: 300,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderColor: '#ddd',
  },
  sidebarHeader: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  sidebarTitle: { fontWeight: '600' },
  profile: { alignItems: 'center', padding: 15 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  profileName: { fontSize: 16, fontWeight: '600' },
  profileDesc: { textAlign: 'center', color: '#777', fontSize: 12 },
  sidebarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  optionText: { marginLeft: 10 },
  sectionItem: { padding: 15, borderTopWidth: 1, borderColor: '#eee' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  sectionTitle: { marginLeft: 10, fontWeight: '500' },
  sectionEmpty: { color: '#999', fontSize: 12 },
  sectionContent: { marginTop: 10 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
