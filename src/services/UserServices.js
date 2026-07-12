import apiClient from "./services";

export default {
  getUser() {
    return apiClient.get("users");
  },
  getUserById(userId){
    return apiClient.get("users/"+userId);
  },
  addUser(user) {
    return apiClient.post("users", user);
  },
  updateUser(userId, user){
    return apiClient.put("users/" + userId,  user);
  },
  deleteUser(user){
    return apiClient.delete("users/"+user);
  },
  loginUser(user) {
    return apiClient.post("login", user.value, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        crossDomain: true,
        Authorization:
          "Basic " + btoa(user.value.email + ":" + user.value.password),
      },
    });
  },
  logoutUser() {
    return apiClient.post("logout");
  },
};
