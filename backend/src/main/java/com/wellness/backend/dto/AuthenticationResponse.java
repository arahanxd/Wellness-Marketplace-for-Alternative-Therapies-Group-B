package com.wellness.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthenticationResponse {

    private String accessToken;
    private String role;
    private String name;
    private boolean emailVerified;

    public AuthenticationResponse(String accessToken, String role, String name, boolean emailVerified) {
        this.accessToken = accessToken;
        this.role = role;
        this.name = name;
        this.emailVerified = emailVerified;
    }
}
