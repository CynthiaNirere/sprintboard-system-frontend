import apiClient from "./services";

export default {
  getRetroItems() {
    return apiClient.get("retroItems");
  },
  getRetroItemsById(retroItemId) {
    return apiClient.get("retroItems/" + retroItemId);
  },
  findSprintRetroItem(sprintId){
    return apiClient.get("retroItems/sprint/" + sprintId);
  },
  addRetroItem(retro) {
    return apiClient.post("retroItems", retro);
  },
  updateRetroItem(retroItemId, retro) {
    return apiClient.put("retroItems/" + retroItemId, retro);
  },
  deleteRetroItem(retroItemId) {
    return apiClient.delete("retroItems/" + retroItemId);
  },
};