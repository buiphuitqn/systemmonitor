import axios from 'axios'
import { BASE_URL_API } from './Config'
import { getCookieValue} from './Commons'

const api = axios.create({
  baseURL: BASE_URL_API,
})

api.interceptors.request.use((config) => {
  const token = getCookieValue('tokenInfo')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
