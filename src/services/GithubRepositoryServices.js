import apiClient from "./services";

export default {
  getReposByProject(projectId) {
    return apiClient.get("repo/project/" + projectId);
  },
  addRepo( repo) {
    return apiClient.post("repo", repo);
  },
  getRepos() {
    return apiClient.post("repo");
  },
  getRepo(repoId) {
    return apiClient.post("repo/" + repoId);
  },
  updateRepo(repoId, repo) {
    return apiClient.put("/repo/" + repoId, repo);
  },
  deleteRepo( repoId) {
    return apiClient.delete( "/repo/" + repoId);
  },
};