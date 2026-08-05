import apiClient from "./services";

export default {
  getBoardStatuses() {
    return apiClient.get("boardStatus");
  },
  getboardStatus(id) {
    return apiClient.get("boardStatus/" + id);
  },
  getboardStatusByColumnOrder(projectId, columnOrder) {
    return apiClient.get("boardStatus/" + projectId + "/column/" + columnOrder);
  },
  getBoardStatusesForProject(projectId) {
    return apiClient.get("boardStatus/project/" + projectId);
  },
  addboardStatus(boardStatus) {
    return apiClient.post("boardStatus", boardStatus);
  },
  updateboardStatus(boardStatusId, boardStatus) {
    return apiClient.put("boardStatus/" + boardStatusId, boardStatus);
  },
  deleteboardStatus(boardStatusId) {
    return apiClient.delete("boardStatus/" + boardStatusId);
  },
  adminRefundboardStatus(boardStatusId, refundAmount) {
    return apiClient.delete("boardStatus/" + boardStatusId + "/refund", { data: { refundAmount } });
  },
};