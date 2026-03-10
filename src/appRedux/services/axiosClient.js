import axios from "axios";
import { BASE_URL_API } from "../../util/Config";
import { getCookieValue, setCookieValue, logOut } from "../../util/Commons";
import { message } from "antd";

const axiosClient = axios.create({
  baseURL: BASE_URL_API,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = getCookieValue("tokenInfo");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Nếu data là FormData thì xóa Content-Type để trình duyệt tự set multipart/form-data
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

let isLoggingOut = false;
let isRefreshing = false;
let failedQueue = [];

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

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const accessToken = getCookieValue("tokenInfo");
      const refreshToken = getCookieValue("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post(`${BASE_URL_API}/token/refresh-token`, {
            accessToken: accessToken,
            refreshToken: refreshToken
          });

          if (res.status === 200) {
            setCookieValue("tokenInfo", res.data.token);
            setCookieValue("refreshToken", res.data.refreshToken);

            axiosClient.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token;
            originalRequest.headers.Authorization = 'Bearer ' + res.data.token;

            processQueue(null, res.data.token);
            return axiosClient(originalRequest);
          }
        } catch (err) {
          processQueue(err, null);
          // Refresh logic failed, force clear cookies to allow clean relogin instead of infinite loops
          if (!isLoggingOut && window.location.pathname !== "/signin") {
            isLoggingOut = true;
            message.error("Phiên làm việc đã hết hạn. Đang đăng xuất...");
            setTimeout(() => {
              logOut();
            }, 2000);
          }
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      // No refresh token available, normal logout route
      if (!isLoggingOut && window.location.pathname !== "/signin") {
        isLoggingOut = true;
        message.error("Phiên làm việc đã hết hạn hoặc tài khoản bị khóa. Đang đăng xuất...");
        setTimeout(() => {
          logOut();
        }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;