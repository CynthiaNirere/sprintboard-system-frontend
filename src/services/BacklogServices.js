import apiClient from "./services";

export default {
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
  return apiClient.put("ticket/" + ticketId + "/unassign");
},
};