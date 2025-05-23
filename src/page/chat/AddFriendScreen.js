import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import QRCode from "react-native-qrcode-svg";
import { useNavigation } from "@react-navigation/native";
import { getUserByPhoneService } from "../../service/userService";

const AddFriendScreen = ({ route }) => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState("");
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
        navigation.navigate("UserProfileScreen", {
          user: foundUser,
          socketRef,
          onlineUsers,
        });
      } else {
        Alert.alert("Không tìm thấy", "Không tìm thấy người dùng.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f6f8fa" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Thêm bạn</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* QR Code Box */}
        <View style={styles.qrContainer}>
          <Text style={styles.name}>Nguyễn Tấn Lộc</Text>
          <View style={styles.qrCode}>
            <QRCode value="https://zalo.me/..." size={140} />
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
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
          />
          <TouchableOpacity
            style={[
              styles.arrowButton,
              { opacity: phone.trim() ? 1 : 0.5 },
            ]}
            onPress={handleSearchAndNavigate}
            disabled={!phone.trim() || loading}
          >
            <Icon name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Options */}
        <View style={styles.optionsWrap}>
          {[
            { icon: "qr-code-outline", label: "Quét mã QR" },
            { icon: "book-outline", label: "Danh bạ máy" },
            { icon: "people-outline", label: "Có thể bạn quen" },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.optionRow}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconBox}>
                <Icon name={item.icon} size={22} color="#2196f3" />
              </View>
              <Text style={styles.optionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer note */}
        <Text style={styles.footerText}>
          Xem các lời mời kết bạn đã gửi trong Danh bạ
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddFriendScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  headerText: {
    color: "#222",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 14,
  },
  scroll: {
    padding: 18,
    backgroundColor: "#f6f8fa",
    flexGrow: 1,
  },
  qrContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 22,
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  name: {
    fontSize: 17,
    color: "#222",
    fontWeight: "bold",
    marginBottom: 12,
  },
  qrCode: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  qrNote: {
    marginTop: 8,
    color: "#666",
    fontSize: 13,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
    marginBottom: 18,
  },
  prefixBox: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f6f8fa",
  },
  prefixText: {
    color: "#222",
    fontWeight: "bold",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    color: "#222",
    fontSize: 16,
    backgroundColor: "#fff",
    height: 48,
  },
  arrowButton: {
    padding: 14,
    backgroundColor: "#2196f3",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  optionsWrap: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionText: {
    color: "#222",
    fontSize: 16,
  },
  footerText: {
    marginTop: 36,
    color: "#888",
    fontSize: 13,
    textAlign: "center",
  },
});