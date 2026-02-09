package com.wellnesshub.backend.auth;

import com.wellnesshub.backend.user.UserRole;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class AuthDtos {

    public static class RegisterRequest {
        @NotBlank
        private String fullName;
        @Email
        private String email;
        @NotBlank
        private String password;
        @NotNull
        private UserRole role;
        private String specialization;

        public RegisterRequest() {}

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }
        public String getSpecialization() { return specialization; }
        public void setSpecialization(String specialization) { this.specialization = specialization; }
    }

    public static class LoginRequest {
        @Email
        private String email;
        @NotBlank
        private String password;

        public LoginRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String role;

        public AuthResponse(String accessToken, String refreshToken, String role) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.role = role;
        }

        public String getAccessToken() { return accessToken; }
        public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}

