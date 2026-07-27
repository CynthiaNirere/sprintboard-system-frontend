import apiClient from "./services";

export default {
  getProjects() {
    return apiClient.get("projects");
  },
  getProject(projectId) {
    return apiClient.get("projects/" + projectId);
  },
  getProjectMembers(projectId) {
    return apiClient.get("projects/" + projectId + "/members");
  },
  getUserProjects(userId) {
    return apiClient.get("projects/user/" + userId);
  },
  addProject(project) {
    return apiClient.post("projects", project);
  },
  addProjectMember(projectId, projectMember) {
    return apiClient.post("projects/" + projectId + "/members", projectMember);
  },
  updateProject(projectId, project) {
    return apiClient.put("projects/" + projectId, project);
  },
  updateProjectMember(projectId, projectMember) {
    return apiClient.put("projects/" + projectId + "/members", projectMember);
  },
  deleteProject(projectId) {
    return apiClient.delete("projects/" + projectId);
  },
  deleteProjectMember(projectId, userId) {
    return apiClient.delete("projects/" + projectId + "/members/" + userId);
  }
};