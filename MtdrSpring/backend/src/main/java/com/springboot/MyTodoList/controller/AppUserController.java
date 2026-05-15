package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.UpdateProfileRequest;
import com.springboot.MyTodoList.dto.UserDTO;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.repository.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class AppUserController {

    private static final Logger log = LoggerFactory.getLogger(AppUserController.class);

    @Autowired
    private AppUserRepository userRepository;

    /**
     * PUT /api/users/profile
     * Updates the authenticated user's name, email, and bio.
     */
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            Authentication auth,
            @RequestBody UpdateProfileRequest request) {

        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] PUT /users/profile - User: {}", userId);

        AppUser user = userRepository.findById(userId)
                .orElse(null);
        if (user == null) {
            log.warn("⚠️ [WARN] PUT /users/profile - User {} not found", userId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            user.setEmail(request.getEmail().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }

        AppUser saved = userRepository.save(user);
        log.info("✅ [SUCCESS] PUT /users/profile - Updated user {}: name='{}', email='{}'",
                userId, saved.getName(), saved.getEmail());

        return ResponseEntity.ok(UserDTO.from(saved));
    }

    /**
     * GET /api/users/me
     * Returns the authenticated user's full profile.
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getMe(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return userRepository.findById(userId)
                .map(u -> ResponseEntity.ok(UserDTO.from(u)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }
}
