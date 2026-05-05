package com.hmi.alarm.controller;

import com.hmi.alarm.dto.JwtResponse;
import com.hmi.alarm.dto.LoginRequest;
import com.hmi.alarm.dto.MessageResponse;
import com.hmi.alarm.dto.SignupRequest;
import com.hmi.alarm.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<JwtResponse> signup(@Valid @RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.signup(request));
    }

    @PostMapping("/signin")
    public ResponseEntity<JwtResponse> signin(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.signin(request));
    }

    /**
     * Stateless logout - the client just discards the token, but we provide
     * an endpoint so the UI can confirm and clear local state cleanly.
     * In a future iteration this is where a server-side token blacklist would live.
     */
    @PostMapping("/signout")
    public ResponseEntity<MessageResponse> signout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(new MessageResponse("Signed out successfully"));
    }
}
