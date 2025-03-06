import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
//SEARCH: axios npm github

const baseUrl =
  Platform.OS === "android"
    ? "http://192.168.1.6:8080/api" // URL cho Android và iOS
    : "http://localhost:8080/api"; // URL cho web hoặc môi trường khác

// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: baseUrl,
  withCredentials: true, // để FE có thể nhận cookie từ BE
});

const getToken = async () => {
  return await AsyncStorage.getItem("access_Token");
}

instance.interceptors.request.use(
  async (config) => {
    const token = await getToken(); // Lấy access token từ AsyncStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Thêm Bearer token vào header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// search: How can you use axios interceptors?
// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response && response.data ? response.data : response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const status = error.response?.status || 500;
    switch (status) {
      // authentication (token related issues)
      case 401: {
        // check quyền từ context chuyển qua
        if (
          window.location.pathname !== "/" &&
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          console.log(">>>check error 401: ", error.response.data); // SEARCH: axios get error body
          // window.location.href("/login");
        }

        return error.response.data; //getUserAccount response data(BE) nhưng bị chặn bên res(FE) dù đúng hay sai khi fetch account
      }

      // forbidden (permission related issues)
      case 403: {
        return Promise.reject(error);
      }

      // bad request
      case 400: {
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
