import apiClient from "./services";

export default {
  getRefunds() {
    return apiClient.get("refunds");
  },
  getRefund(id) {
    return apiClient.get("refunds/" + id);
  },
  getRefundsForUser(userId) {
    return apiClient.get("refunds/user/" + userId);
  },
  createRefund(refund) {
    return apiClient.post("refunds", refund);
  },
  updateRefund(refundId, refund) {
    return apiClient.put("refunds/" + refundId, refund);
  },
  deleteRefund(refundId) {
    return apiClient.delete("refunds/" + refundId);
  },
};