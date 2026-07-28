import apiClient from "./services";

export default {
  getRetros() {
    return apiClient.get("retros");
  },
  getRetrosById(retroId) {
    return apiClient.get("retros/" + retroId);
  },
  findSprintRetro(sprintId){
    return apiClient.get("retros/sprint/" + sprintId);
  },
  addRetro(retro) {
    return apiClient.post("retros", retro);
  },
  updateRetro(retroId, retro) {
    return apiClient.put("retros/" + retroId, retro);
  },
  deleteRetro(retroId) {
    return apiClient.delete("retros/" + retroId);
  },
};