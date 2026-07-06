import apiClient from "./services";

export default {
  getSeats() {
    return apiClient.get("seats");
  },
  
  getSeat(id) {
    return apiClient.get("seats/" + id);
  },
  addSeat(seat) {
    return apiClient.post("seats", seat);
  },
  updateSeat(seatId, seat) {
    return apiClient.put("seats/" + seatId, seat);
  },
  deleteSeat(seatId) {
    return apiClient.delete("seats/" + seatId);
  },
};
