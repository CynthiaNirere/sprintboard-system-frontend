import apiClient from "./services";

export default {
  getOrders() {
    return apiClient.get("orders");
  },
  getOrder(id) {
    return apiClient.get("orders/" + id);
  },
  getOrdersForUser(userId) {
    return apiClient.get("orders/user/" + userId);
  },
  addOrder(order) {
    return apiClient.post("orders", order);
  },
  updateOrder(orderId, order) {
    return apiClient.put("orders/" + orderId, order);
  },
};