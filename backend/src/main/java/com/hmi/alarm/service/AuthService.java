package com.hmi.alarm.service;

import com.hmi.alarm.dto.JwtResponse;
import com.hmi.alarm.dto.LoginRequest;
import com.hmi.alarm.dto.SignupRequest;
import com.hmi.alarm.entity.User;
import com.hmi.alarm.exception.BadRequestException;
import com.hmi.alarm.repository.UserRepository;
import com.hmi.alarm.security.JwtUtil;
import com.hmi.alarm.security.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public JwtResponse signup(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        User user = new User(
                request.getUsername(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole()
        );
        user = userRepository.save(user);
        log.info("New user registered: {} ({})", user.getUsername(), user.getRole());

        return buildJwtResponse(user);
    }

    public JwtResponse signin(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        UserDetailsImpl principal = (UserDetailsImpl) auth.getPrincipal();
        String role = principal.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_OPERATOR");

        String token = jwtUtil.generateToken(principal.getUsername(), role, principal.getId());
        long expiresAt = System.currentTimeMillis() + jwtUtil.getExpirationMs();

        User user = userRepository.findByUsername(principal.getUsername()).orElseThrow();
        return new JwtResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole(), expiresAt);
    }

    private JwtResponse buildJwtResponse(User user) {
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        long expiresAt = System.currentTimeMillis() + jwtUtil.getExpirationMs();
        return new JwtResponse(token, user.getId(), user.getUsername(), user.getEmail(), user.getRole(), expiresAt);
    }
}
