package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.dto.AuthResponse;
import com.springboot.MyTodoList.dto.LoginRequest;
import com.springboot.MyTodoList.dto.RegisterRequest;
import com.springboot.MyTodoList.dto.UserDTO;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired private AppUserRepository userRepository;
    @Autowired private JwtTokenProvider jwtTokenProvider;
    @Autowired private PasswordEncoder passwordEncoder;

    // ─────────────────────────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) {
        log.info("🔐 [AUTH] Registering new user - name: '{}', email: '{}'", request.getName(), request.getEmail());

        log.debug("🔍 [LOOKUP] Checking whether email is already registered: {}", request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("⚠️ [WARN] Registration rejected — email already in use: {}", request.getEmail());
            throw new RuntimeException("Email already registered");
        }

        AppUser user = new AppUser();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("developer");
        user.setTelegramConnected(false);

        log.info("💾 [SAVE] Saving new user: {} <{}>", request.getName(), request.getEmail());
        AppUser saved = userRepository.save(user);
        log.info("✅ [SUCCESS] User registered - ID: {}, email: {}", saved.getId(), saved.getEmail());

        String token = jwtTokenProvider.generateToken(saved.getId());
        return new AuthResponse(UserDTO.from(saved), token);
    }

    // ─────────────────────────────────────────────────────────────
    // LOGIN
    // ─────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        log.info("🔐 [AUTH] Login attempt for email: '{}'", request.getEmail());

        log.debug("🔍 [LOOKUP] Fetching user by email: {}", request.getEmail());
        AppUser user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("❌ [ERROR] Invalid credentials — no account for email: {}", request.getEmail());
                    return new RuntimeException("Invalid credentials");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.error("❌ [ERROR] Invalid credentials — wrong password for email: {}", request.getEmail());
            throw new RuntimeException("Invalid credentials");
        }

        log.info("✅ [SUCCESS] User authenticated - ID: {}, email: {}", user.getId(), user.getEmail());
        String token = jwtTokenProvider.generateToken(user.getId());
        return new AuthResponse(UserDTO.from(user), token);
    }
}
