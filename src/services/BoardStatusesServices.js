import apiClient from "./services";

export default {
  getBoardStatuses() {
    return apiClient.get("boardStatus");
  },
  getBoardStatus(id) {
    return apiClient.get("boardStatus/" + id);
  },
  getBoardStatusByColumnOrder(projectId, columnOrder) {
    return apiClient.get("boardStatus/" + projectId + "/column/" + columnOrder);
  },
  getBoardStatusesForProject(projectId) {
    return apiClient.get("boardStatus/project/" + projectId);
  },
  addBoardStatus(projectId, boardStatus) {
    return apiClient.post("project/" + projectId + "/boardStatus", boardStatus);
  },
  updateBoardStatus(projectId, boardStatusId, boardStatus) {
    return apiClient.put("project/" + projectId + "/boardStatus/" + boardStatusId, boardStatus);
  },
  deleteBoardStatus(projectId, boardStatusId) {
    return apiClient.delete("project/" + projectId + "/boardStatus/" + boardStatusId);
  },
  adminRefundBoardStatus(boardStatusId, refundAmount) {
    return apiClient.delete("boardStatus/" + boardStatusId + "/refund", { data: { refundAmount } });
  },
};