import apiClient from "./services";

export default {
  getSprintsByProject(projectId) {
    return apiClient.get("sprints?projectId=" + projectId);
  },
  addSprint(projectId, sprint) {
    return apiClient.post("project/" + projectId + "/sprints", sprint);
  },
  addRecurringSprints(projectId, data) {
    return apiClient.post("project/" + projectId + "/sprints/recurring", data);
  },
  updateSprint(projectId, sprintId, sprint) {
    return apiClient.put("project/" + projectId + "/sprints/" + sprintId, sprint);
  },
  deleteSprint(projectId, sprintId) {
    return apiClient.delete("project/" + projectId + "/sprints/" + sprintId);
  },
};