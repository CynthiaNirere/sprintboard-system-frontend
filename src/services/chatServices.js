import apiClient from "./services";

export default {
  sendMessage(message, history, signal) {
    return apiClient.post("chat", { message, history }, { signal });
  },
};