import apiClient from "./services";

export default {
  getSprintsByProject(projectId) {
    return apiClient.get("sprints?projectId=" + projectId);
  },
  addSprint(sprint) {
    return apiClient.post("sprints", sprint);
  },
  addRecurringSprints(data) {
    return apiClient.post("sprints/recurring", data);
  },
  updateSprint(sprintId, sprint) {
    return apiClient.put("sprints/" + sprintId, sprint);
  },
  deleteSprint(sprintId) {
    return apiClient.delete("sprints/" + sprintId);
  },
};