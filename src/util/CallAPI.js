import axiosClient from "../appRedux/services/axiosClient";
export const fetchStart = (
  "common/fetchStart",
  async ({ url, method, data, params }) => {
    try {
      const response = await axiosClient({
        url,
        method,
        data,
        params,
      });
      return response;
    } catch (error) {
      return error.response?.data || error.message;
    }
  }
);