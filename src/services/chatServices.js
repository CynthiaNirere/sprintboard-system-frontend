import apiClient from "./services";

export default {
  sendMessage(message, history) {
    return apiClient.post("chat", { message, history });
  },
};