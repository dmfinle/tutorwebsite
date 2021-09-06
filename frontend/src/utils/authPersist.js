import axios from "axios";
import jwt_decode from "jwt-decode";

export const checkAuth = () => {
  // Check for token
  if (localStorage.jwtToken) {
    // Set auth token
    setAuthToken(localStorage.jwtToken);

    // Decode token and get user info
    const decoded = jwt_decode(localStorage.jwtToken);
    return decoded;
  }
};
