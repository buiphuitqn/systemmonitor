import axios from "axios";
import {BASE_URL_API} from "../../util/Config";
import { getCookieValue } from "../../util/Commons";

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
  return config;
});

export default axiosClient;