package com.hmi.alarm.dto;

import com.hmi.alarm.entity.Role;

public class JwtResponse {

    private String token;
    private String tokenType = "Bearer";
    private Long id;
    private String username;
    private String email;
    private Role role;
    private long expiresAt;

    public JwtResponse(String token, Long id, String username, String email, Role role, long expiresAt) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.expiresAt = expiresAt;
    }

    public String getToken() { return token; }
    public String getTokenType() { return tokenType; }
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public long getExpiresAt() { return expiresAt; }
}
