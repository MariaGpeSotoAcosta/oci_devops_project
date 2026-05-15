package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.service.JoinCodeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST endpoints for Telegram integration.
 *
 * POST /api/telegram/join-code
 *   → generates a one-time join code for the authenticated user
 *   → returns { "code": "A1B2C3D4", "expiresInMinutes": 15 }
 */
@RestController
@RequestMapping("/api/telegram")
public class TelegramController {

    private static final Logger log = LoggerFactory.getLogger(TelegramController.class);

    @Autowired
    private JoinCodeService joinCodeService;

    /**
     * Generates a fresh join code for the currently logged-in user.
     * The frontend calls this when the user clicks "Generate Join Code".
     */
    @PostMapping("/join-code")
    public ResponseEntity<Map<String, Object>> generateJoinCode(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] POST /telegram/join-code - User: {}", userId);

        try {
            String code = joinCodeService.generateCode(userId);
            log.info("✅ [SUCCESS] Join code generated for user {}", userId);

            return ResponseEntity.ok(Map.of(
                "code",           code,
                "expiresInMinutes", 15
            ));
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] Could not generate join code for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}