import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import {sendCode, resetPassword} from "../../redux/authSlice";

const ResetPasswordScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      setMessage("Vui lòng nhập email để gửi mã xác nhận");
      return;
    }

    // Gửi mã xác nhận đến email
    setMessage("Đang gửi mã xác nhận...");
    let send = await dispatch(sendCode(email));

    if (send.payload.EC !== 0) {
      setMessage(`❌ ${send.payload.EM}`);
    } else if (send.payload.EC === 0) {
      setMessage("✅ Mã xác nhận đã được gửi đến email của bạn!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !code || !password) {
      setMessage("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const response = await dispatch(
        resetPassword({ email, code, password })
      ).unwrap();
      if (response.EC === 0) {
        setMessage("✅ Đặt lại mật khẩu thành công!");
        // navigation.navigate("Login"); // Chuyển hướng đến trang đăng nhập
      } else {
        setMessage(`❌ ${response.EM}`);
      }
    } catch (err) {
      setMessage("❌ Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Đặt lại mật khẩu</Text>

        {/* Email */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Code */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Mã xác nhận (Code)</Text>
          <View style={styles.codeRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Nhập mã xác nhận"
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity
              style={styles.sendBtn}
              onPress={handleSendCode}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendBtnText}>Gửi mã</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Mật khẩu mới */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu mới"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Xác nhận</Text>
        </TouchableOpacity>

        {/* Message */}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f9f9f9",
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sendBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
  message: {
    textAlign: "center",
    marginTop: 16,
    color: "#333",
  },
});
