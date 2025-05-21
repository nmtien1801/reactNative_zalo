import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserByPhoneService } from "../../service/userService"; // Giả sử bạn đã định nghĩa hàm này trong userService.js
const AddFriendScreen = ({ route }) => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { socketRef, onlineUsers } = route.params || {};

  const handleSearchAndNavigate = async () => {
   
    const query = phone.trim();
    if (!query) return;

    try {
      setLoading(true);
      const response = await getUserByPhoneService(query);
      if (
        response.EC === 0 &&
        response.EM === "User found" &&
        response.DT &&
        response.DT.DT
      ) {
        const foundUser = response.DT.DT;
        navigation.navigate('UserProfileScreen', { user: foundUser, socketRef, onlineUsers }); // truyền user qua screen
      } else {
        Alert.alert("Not Found", "Không tìm thấy người dùng.");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      Alert.alert("Error", "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>

        <TouchableOpacity onPress={() => navigation.goBack()} >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Add friends</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* QR Code Box */}
        <View style={styles.qrContainer}>
          <Text style={styles.name}>Nguyễn Tấn Lộc</Text>
          <View style={styles.qrCode}>
            <QRCode value="https://zalo.me/..." size={150} />
          </View>
          <Text style={styles.qrNote}>Quét mã để thêm bạn Zata với tôi</Text>
        </View>

        {/* Phone Number Input */}
        <View style={styles.phoneInputRow}>
          <View style={styles.prefixBox}>
            <Text style={styles.prefixText}>+84</Text>
          </View>

          <TextInput
            style={styles.phoneInput}
            placeholder="Enter phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TouchableOpacity style={styles.arrowButton} onPress={handleSearchAndNavigate}>
            <Icon name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Options */}
        {[
          { icon: 'qr-code-outline', label: 'Scan QR code' },
          { icon: 'book-outline', label: 'Phonebook' },
          { icon: 'people-outline', label: 'People you may know' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.optionRow}>
            <Icon name={item.icon} size={22} color="#00aaff" />
            <Text style={styles.optionText}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Footer note */}
        <Text style={styles.footerText}>View sent friend requests in Contacts</Text>
      </ScrollView>
    </View>
  );
};

export default AddFriendScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1c1c1e',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
  scroll: {
    padding: 16,
    backgroundColor: '#000',
  },
  qrContainer: {
    backgroundColor: '#2f4f6f',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  name: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  qrCode: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
  },
  qrNote: {
    marginTop: 10,
    color: '#eee',
    fontSize: 12,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
  },
  prefixBox: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderColor: '#444',
  },
  prefixText: {
    color: '#fff',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 10,
    color: '#fff',
  },
  arrowButton: {
    padding: 14,
    backgroundColor: '#00aaff',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  optionText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 15,
  },
  footerText: {
    marginTop: 40,
    color: '#aaa',
    fontSize: 12,
    textAlign: 'center',
  },
});
