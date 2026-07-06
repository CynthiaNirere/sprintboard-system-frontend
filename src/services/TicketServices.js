import apiClient from "./services";

export default {
  getTickets() {
    return apiClient.get("tickets");
  },
  getTicket(id) {
    return apiClient.get("tickets/" + id);
  },
  getTicketsForUser(userId) {
    return apiClient.get("tickets/user/" + userId);
  },
  addTicket(ticket) {
    return apiClient.post("tickets", ticket);
  },
  updateTicket(ticketId, ticket) {
    return apiClient.put("tickets/" + ticketId, ticket);
  },
  deleteTicket(ticketId) {
    return apiClient.delete("tickets/" + ticketId);
  },

  adminRefundTicket(ticketId, refundAmount) {
    return apiClient.delete("tickets/" + ticketId + "/refund", { data: { refundAmount } });
  },
};