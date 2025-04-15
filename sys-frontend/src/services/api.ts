import axios from "axios"
import toast from "react-hot-toast"

const api = axios.create({
  baseURL: "https://requisition-system-web.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests if it exists
const token = localStorage.getItem("token")
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error

    // Handle different error statuses
    if (response) {
      const { status, data } = response

      // Authentication errors
      if (status === 401) {
        localStorage.removeItem("token")
        if (window.location.pathname !== "/login") {
          toast.error("Your session has expired. Please log in again.")
          window.location.href = "/login"
        }
      }

      // Show error message from API if available
      if (data && data.message) {
        toast.error(data.message)
      } else {
        toast.error("An error occurred. Please try again.")
      }
    } else {
      // Network errors
      toast.error("Network error. Please check your connection.")
    }

    return Promise.reject(error)
  },
)

export default api
