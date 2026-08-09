import apiClient from "./services";

export default {
  getTestHistory(testId) {
    return apiClient.get("/test/" + testId + "/history");
  },
  addTestHistory(testId, data) {
    return apiClient.post("/test/" + testId + "/history", data);
  }
};