import apiClient from "./services";

export default {
  getTickets() {
    return apiClient.get("ticket");
  },
  getTicket(id) {
    return apiClient.get("ticket/" + id);
  },
  getTicketsForProject(projectId) {
    return apiClient.get("ticket/project/" + projectId);
  },
  getTicketsForSprint(sprintId) {
    return apiClient.get("ticket/sprint/" + sprintId);
  },
  addTicket(ticket) {
    return apiClient.post("ticket", ticket);
  },
  updateTicket(ticketId, ticket) {
    return apiClient.put("ticket/" + ticketId, ticket);
  },
  deleteTicket(ticketId) {
    return apiClient.delete("ticket/" + ticketId);
  },

  adminRefundTicket(ticketId, refundAmount) {
    return apiClient.delete("ticket/" + ticketId + "/refund", { data: { refundAmount } });
  },
};