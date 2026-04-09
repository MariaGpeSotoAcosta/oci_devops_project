package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.AuthResponse;
import com.springboot.MyTodoList.dto.LoginRequest;
import com.springboot.MyTodoList.dto.RegisterRequest;
import com.springboot.MyTodoList.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    /**
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        log.info("🚀 [REQUEST] POST /auth/register - Payload: {{name: '{}', email: '{}'}}", request.getName(), request.getEmail());
        try {
            AuthResponse response = authService.register(request);
            log.info("✅ [SUCCESS] POST /auth/register - User registered: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] POST /auth/register - Registration failed for '{}': {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        log.info("🚀 [REQUEST] POST /auth/login - Payload: {{email: '{}'}} (password omitted)", request.getEmail());
        try {
            AuthResponse response = authService.login(request);
            log.info("✅ [SUCCESS] POST /auth/login - Login successful: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] POST /auth/login - Login failed for '{}': {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        log.info("🚀 [REQUEST] POST /auth/logout - Stateless logout acknowledged");
        return ResponseEntity.ok().build();
    }
}
