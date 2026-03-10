import cookie from "react-cookies";
import { BASE_URL_APP } from "./Config";
/**
 * getCookieValue: Lấy cookie
 *
 * @param {*} name
 * @returns
 */
export const getCookieValue = (name) => {
  return cookie.load(name);
};

export const setCookieValue = (name, value, opt = {}) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // Default to 7 days expiration
  return cookie.save(name, value, { path: '/', expires: expires, ...opt });
};
export const removeCookieValue = (name) => {
  return cookie.remove(name, { path: "/" });
};

export const getTokenInfo = () => {
  return getCookieValue("tokenInfo");
};

/**
 * Lưu dữ liệu vào localStorage
 *
 * @param {*} key
 * @param {*} value
 * @returns
 */
export const setLocalStorage = (key, value) => {
  return localStorage.setItem(key, JSON.stringify(value));
};

/**
 * Lấy dữ liệu từ localStorage
 *
 * @param {*} key
 * @returns
 */
export const getLocalStorage = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

/**
 * Xoá dữ liệu từ localStorage theo key
 *
 * @param {*} key
 * @returns
 */
export const removeLocalStorage = (key) => {
  return localStorage.removeItem(key);
};

/**
 * Xoá hết dữ liệu trong localStorage
 *
 * @returns
 */
export const removeAllLocalStorage = () => {
  return localStorage.clear();
};


export const logOut = async () => {
  await removeCookieValue("tokenInfo");
  await removeCookieValue("refreshToken");

  await removeLocalStorage("userInfo");
  // await removeAllLocalStorage();

  if (!getCookieValue("tokenInfo")) {
    window.location.href = (await BASE_URL_APP) + "/signin";
  }
};
