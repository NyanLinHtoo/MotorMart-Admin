import { useState, useEffect } from "react";
import ApiService from "../api_service/apiService";
import { LoginPayload } from "../types/login";


const UseAuth = () => {
  const [user, setUser] = useState<{ username: string; userId: string } | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const clearTokenAfterTimeout = () => {
    // Remove the token after 1 hour (3600000 milliseconds)
    const expirationTimer = setTimeout(() => {
      localStorage.removeItem("jwt_token");
      console.log("JWT token has been removed due to timeout.");
    }, 3600000);

    return expirationTimer;
  };

  useEffect(() => {
    // Check for an existing token and clear it if expired
    const token = localStorage.getItem("jwt_token");
    const expiration = localStorage.getItem("token_expiration");

    if (token && expiration) {
      const remainingTime = +expiration - Date.now();
      if (remainingTime <= 0) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("token_expiration");
      } else {
        // Set a timeout to clear the token
        setTimeout(() => {
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("token_expiration");
        }, remainingTime);
      }
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    try {
      const response = await ApiService.loginUser(payload);
      const user = response.data.user;

      if (user) {
        const userData = {
          username: user.username,
          userId: user.id,
          email: user.email,
          phonenumber: user.phonenumber,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("jwt_token", user.token);

        // Set expiration time
        const expirationTime = Date.now() + 3600000; // 1 hour from now
        localStorage.setItem("token_expiration", expirationTime.toString());

        // Start the timer
        clearTokenAfterTimeout();
      }

      return response;
    } catch (err: any) {
      console.error("Login failed:", err);
      throw err; // Allow the caller to handle errors
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("token_expiration");
  };

  return { login, logout, user };
};

export default UseAuth;
