package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.JoinCode;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.JoinCodeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class JoinCodeService {

    private static final Logger log = LoggerFactory.getLogger(JoinCodeService.class);

    private static final int EXPIRY_MINUTES = 15;

    @Autowired private JoinCodeRepository joinCodeRepository;
    @Autowired private AppUserRepository  userRepository;

    // ── Generate ──────────────────────────────────────────────────

    @Transactional
    public String generateCode(Long userId) {
        log.info("🔑 [JOINCODE] Generating join code for user {}", userId);

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        String code = UUID.randomUUID()
                          .toString()
                          .replace("-", "")
                          .substring(0, 8)
                          .toUpperCase();

        JoinCode joinCode = new JoinCode();
        joinCode.setJoinCode(code);
        joinCode.setUser(user);
        joinCode.setCreatedAt(LocalDateTime.now());
        joinCode.setExpiration(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));

        joinCodeRepository.save(joinCode);

        log.info("✅ [JOINCODE] Code '{}' created for user {} (expires in {} min)",
                 code, userId, EXPIRY_MINUTES);

        return code;
    }

    // ── Link Telegram account ─────────────────────────────────────

    /**
     * Validates the join code and links the Telegram chatId to the AppUser
     * in a SINGLE @Transactional — both saves commit together.
     *
     * This is the fix: BotActions is not a Spring bean so it has no transaction.
     * Moving the saves here guarantees the COMMIT reaches Oracle.
     */
    @Transactional
    public AppUser linkTelegramAccount(String code, Long telegramChatId) {
        log.info("🔗 [JOINCODE] Linking chatId {} with code '{}'", telegramChatId, code);

        JoinCode joinCode = joinCodeRepository.findByJoinCode(code)
                .orElseThrow(() -> {
                    log.warn("❌ [JOINCODE] Code '{}' not found", code);
                    return new RuntimeException("Code not found");
                });

        if (!joinCode.isValid()) {
            log.warn("❌ [JOINCODE] Code '{}' is expired or already used (usedAt={}, expiration={})",
                     code, joinCode.getUsedAt(), joinCode.getExpiration());
            throw new RuntimeException("Code expired or already used");
        }

        // 1. Mark code as used
        joinCode.setUsedAt(LocalDateTime.now());
        joinCodeRepository.save(joinCode);

        // 2. Link chatId to AppUser
        AppUser user = joinCode.getUser();
        user.setTelegramChatId(telegramChatId);
        user.setTelegramConnected(true);
        userRepository.save(user);

        log.info("✅ [JOINCODE] chatId {} linked to user {} ({})",
                 telegramChatId, user.getId(), user.getName());

        return user;
    }
}
