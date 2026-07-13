import apiClient from "./services";

export default {
  getProjects() {
    return apiClient.get("projects");
  },
  getProject(id) {
    return apiClient.get("projects/" + id);
  },
  addProject(project) {
    return apiClient.post("projects", project);
  },
  updateProject(projectId, project) {
    return apiClient.put("projects/" + projectId, project);
  },
  deleteProject(projectId) {
    return apiClient.delete("projects/" + projectId);
  },
};