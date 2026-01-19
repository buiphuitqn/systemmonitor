import cookie from "react-cookies";
/**
 * getCookieValue: Lấy cookie
 *
 * @param {*} name
 * @returns
 */
export const getCookieValue = (name) => {
  return cookie.load(name);
};