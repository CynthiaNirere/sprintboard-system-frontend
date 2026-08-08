import apiClient from "./services";

export default {
  getTestsForTicket(ticketId) {
    return apiClient.get("/ticket/" + ticketId + "/test/");
  },
  addTest(data) {
    return apiClient.post("/test/", data);
  },
  updateTest(testId, data) {
    return apiClient.put("/test/" + testId, data);
  },
  deleteTest(testId) {
    return apiClient.delete("/test/" + testId);
  },
};