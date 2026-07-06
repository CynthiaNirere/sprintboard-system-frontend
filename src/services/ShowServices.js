import apiClient from "./services";

export default {
  getShows() {
    return apiClient.get("shows");
  },
  
  getShow(id) {
    return apiClient.get("shows/" + id);
  },
  addShow(show) {
    return apiClient.post("shows", show);
  },
  updateShow(showId, show) {
    return apiClient.put("shows/" + showId, show);
  },
  deleteShow(showId) {
    return apiClient.delete("shows/" + showId);
  },
};
