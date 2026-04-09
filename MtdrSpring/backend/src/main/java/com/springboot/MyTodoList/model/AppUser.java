package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Application user entity - distinct from the legacy User entity.
 * Maps to APP_USERS table.
 */
@Entity
@Table(name = "APP_USERS")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "PASSWORD", nullable = false, length = 200)
    private String password;

    @Column(name = "ROLE", length = 20)
    private String role; // "admin", "developer", "viewer"

    @Column(name = "TELEGRAM_CONNECTED")
    private Boolean telegramConnected = false;

    @Column(name = "TELEGRAM_USERNAME", length = 100)
    private String telegramUsername;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (role == null) role = "developer";
        if (telegramConnected == null) telegramConnected = false;
    }

    public AppUser() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getTelegramConnected() { return telegramConnected; }
    public void setTelegramConnected(Boolean telegramConnected) { this.telegramConnected = telegramConnected; }

    public String getTelegramUsername() { return telegramUsername; }
    public void setTelegramUsername(String telegramUsername) { this.telegramUsername = telegramUsername; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
