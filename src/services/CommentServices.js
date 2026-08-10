import apiClient from "./services";

export default {
  addComment(comment) {
    return apiClient.post("comment/", comment);
  },
  getCommentsForTicket(ticketId) {
    return apiClient.get("comment/ticket/" + ticketId);
  }
};