import jwt_decode from "jwt-decode";
import setAuthToken from "./setAuthToken";

export const checkAuth = () => {
  // Check for token
  //TODO Not a good practice to store in localstorage. Susceptible to XSS attacks
  if (localStorage.jwtToken) {
    // Set auth token
    setAuthToken(localStorage.jwtToken);

    // Decode token and get user info
    const decoded = jwt_decode(localStorage.jwtToken);
    return decoded;
  }
};
