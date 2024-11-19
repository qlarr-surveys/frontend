import { jwtDecode } from "jwt-decode";
import CookiesService from "./CookiesService";

class TokenService {
  getRefreshToken() {
    return this.getUser()?.refreshToken;
  }

  getAuthToken() {
    return this.getUser()?.accessToken;
  }

  getUser() {
    const user = CookiesService.getObject("user");
    return user;
  }

  isAuthenticated() {
    const authToken = this.getAuthToken();

    if (!authToken || authToken.length === 0) {
      return false;
    }

    try {
      const decodedToken = jwtDecode(authToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  setSession(user) {
    CookiesService.setObject(user, "user");
  }

  removeSession() {
    CookiesService.removeByKey("user");
  }
}

export default new TokenService();
