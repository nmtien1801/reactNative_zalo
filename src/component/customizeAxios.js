import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
//SEARCH: axios npm github

const URL_ANDROID = "http://192.168.1.5:8080/api"
URL_WEB="http://localhost:8080/api"

const baseUrl =
  Platform.OS === "android"
    ? URL_ANDROID // URL cho Android và iOS
    : URL_WEB; // URL cho web hoặc môi trường khác

// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // để FE có thể nhận cookie từ BE
});

// Cài đặt header mặc định
instance.defaults.headers.common["Authorization"] = `Bearer ${AsyncStorage.getItem("access_Token")}`;

// Interceptor cho request
const getToken = async () => {
  return await AsyncStorage.getItem("access_Token");
};

instance.interceptors.request.use(
  async (config) => {
    const token = await getToken(); // Lấy access token từ AsyncStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Thêm Bearer token vào header
    }
    console.log("Body:", config.data);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_Token");
    if (!refreshToken) throw new Error("No refresh token available");

    const response = await axios.post(`${baseUrl}/refreshToken`, {
      refresh_Token: refreshToken,
    });

    const access_Token = response.data.DT.newAccessToken;
    const refresh_Token = response.data.DT.newRefreshToken;

    // Cập nhật token mới vào AsyncStorage
    await AsyncStorage.setItem("access_Token", access_Token);
    await AsyncStorage.setItem("refresh_Token", refresh_Token);

    return access_Token;
  } catch (error) {
    console.error("Refresh token failed:", error);
    AsyncStorage.removeItem("access_Token");
    AsyncStorage.removeItem("refresh_Token");
    return null;
  }
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

let isRefreshing = false;
let failedQueue = [];

instance.interceptors.response.use(
  (response) => (response && response.data ? response.data : response),
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status || 500;
    switch (status) {
      case 401: {
        const navigation = useNavigation();
        const currentRoute = navigation.getState().routes[navigation.getState().index].name;

        if (['Login', 'Register', 'ResetPassword'].includes(currentRoute)) {
          console.warn("401 on auth page, skip refresh");
          return Promise.reject(error);
        }

        if (!originalRequest._retry) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return instance(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          let newAccessToken = await refreshAccessToken();

          if (!newAccessToken) {
            navigation.navigate('Login');
            return Promise.reject(error);
          }

          instance.defaults.headers['Authorization'] = 'Bearer ' + newAccessToken;
          processQueue(null, newAccessToken);

          return instance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          // handle logout
          AsyncStorage.removeItem('access_Token');
          AsyncStorage.removeItem('refresh_Token');
          navigation.navigate('Login');
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      // bad request
      case 400: {
        return error.response.data; // Bad request
      }

      // forbidden (permission related issues)
      case 403: {
        return Promise.reject(error);
      }

      // not found get /post / delete /put
      case 404: {
        return Promise.reject(error);
      }

      // conflict
      case 409: {
        return Promise.reject(error);
      }

      // unprocessable
      case 422: {
        return Promise.reject(error);
      }

      // generic api error (server related) unexpected
      default: {
        return Promise.reject(error);
      }
    }
  }
);

export default instance;
