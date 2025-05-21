import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Eye, EyeOff, RefreshCw } from "lucide-react-native";
import { useDispatch, useSelector } from "react-redux";
import { register, verifyEmail } from "../../redux/authSlice";
import { useNavigation } from "@react-navigation/native";

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(0); // đếm ngược 60s
  const [code, setCode] = useState({}); // mã xác thực trong 60s

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    captcha: "",
    gender: "",
    dob: "",
    avatar: "",
    code: "",
  });

  const handleChange = (name, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async () => {
    setErrorMessage("");

    // kiểm tra username
    if (!formData.username) {
      setErrorMessage("username không được để trống");
      return;
    }

    // kiểm tra email
    if (!formData.email) {
      setErrorMessage("Email không được để trống");
      return;
    }

    // kiểm tra tài khoản 10 ký tự bất kì
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      setErrorMessage("Số tài khoản phải bao gồm đúng 10 ký tự!");
      return;
    }

    // kiểm tra password
    if (!formData.password) {
      setErrorMessage("password không được để trống");
      return;
    }

    // Kiểm tra mật khẩu và mật khẩu nhập lại có khớp không
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Mật khẩu và mật khẩu nhập lại không khớp!");

      return;
    }

    // kiểm tra captcha
    if (!formData.captcha) {
      setErrorMessage("captcha không được để trống");
      return;
    }

    // kiểm tra code verify email
    let currentTime = Date.now();
    if (currentTime - code.timestamp > 60000) {
      setErrorMessage("❌ Mã đã hết hạn sau 60s");
    } else if (+formData.captcha !== +code.code) {
      setErrorMessage("❌ Mã không đúng");
    } else {
      // Gửi thông tin đăng ký đi
      let res = await dispatch(register(formData));
      if (res.payload.EC === 0) {
        navigation.navigate("Login"); // Điều hướng đến màn hình Login
      } else {
        setErrorMessage(res.payload.EM);
      }
    }
  };

  const handleVerifyEmail = async () => {
    // Gửi mã xác minh qua email
    let res = await dispatch(verifyEmail(formData.email));
    if (res.payload.EC === 0) {
      setCode(res.payload.DT);
    }

    // Bắt đầu đếm ngược
    setCountdown(60);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Zata</Text>
        <Text style={styles.subtitle}>Đăng ký với mật khẩu</Text>

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Tên người dùng"
            value={formData.username}
            onChangeText={(text) => handleChange("username", text)}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={formData.email}
            keyboardType="email-address"
            onChangeText={(text) => handleChange("email", text)}
          />
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Số tài khoản"
            value={formData.phoneNumber}
            onChangeText={(text) => handleChange("phoneNumber", text)}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(text) => handleChange("password", text)}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconButton}
          >
            {showPassword ? (
              <EyeOff size={20} color="#555" />
            ) : (
              <Eye size={20} color="#555" />
            )}
          </TouchableOpacity>
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry={!showConfirmPassword}
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange("confirmPassword", text)}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.iconButton}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color="#555" />
            ) : (
              <Eye size={20} color="#555" />
            )}
          </TouchableOpacity>
        </View>

        {/* Captcha Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mã kiểm tra"
            value={formData.captcha}
            onChangeText={(text) => handleChange("captcha", text)}
          />
          <TouchableOpacity
            onPress={handleVerifyEmail}
            disabled={countdown > 0}
            style={[styles.iconButton, countdown > 0 && styles.disabledButton]}
          >
            {countdown > 0 ? (
              <Text style={styles.text60}>{countdown}s</Text>
            ) : (
              <RefreshCw color="#333" size={20} />
            )}
          </TouchableOpacity>
        </View>

        {/* gender Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Gender"
            value={formData.gender}
            onChangeText={(text) => handleChange("gender", text)}
          />
        </View>

        {/* dob Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Dob"
            value={formData.dob}
            onChangeText={(text) => handleChange("dob", text)}
          />
        </View>

        {errorMessage !== "" && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity mode="contained" style={styles.button} onPress={handleSubmit}>
          <Text style={{color:'white'}}>Đăng ký</Text>
        </TouchableOpacity>

        {/* Links */}
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    padding: 24,
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2962ff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
    width: "100%",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  iconButton: {
    padding: 10,
  },
  button: {
    width: "100%",
    paddingVertical: 8,
    marginVertical: 10,
    backgroundColor: "#2962ff",
    alignItems: 'center',       // Căn giữa ngang
    justifyContent: 'center',   // Căn giữa dọc
  },
  linkText: {
    color: "#2962ff",
    marginTop: 8,
    fontSize: 14,
  },
  text60: {
    color: "#333",
    fontSize: 16,
  },
  errorContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
  },
});
