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
  getTicketsForUser(userId) {
    return apiClient.get("ticket/user/" + userId);
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
  getBacklog(projectId) {
    return apiClient.get("ticket/backlog?projectId=" + projectId);
  },
  getTicketsBySprint(sprintId) {
    return apiClient.get("ticket/sprint/" + sprintId);
  },
  assignToSprint(ticketId, sprintId) {
    return apiClient.put("ticket/" + ticketId + "/assign", { sprintId });
  },
  removeFromSprint(ticketId) {
    return apiClient.put("ticket/" + ticketId + "/unassign", {});
  },
};