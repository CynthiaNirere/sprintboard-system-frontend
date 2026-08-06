import apiClient from "./services";

export default {
  getUserActivityLogs() {
    return apiClient.get("userActivityLogs");
  }
};