package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Maps to the JOIN_CODE table.
 * A join code is generated from the web app and used once to link
 * a Telegram account to an AppUser.
 */
@Entity
@Table(name = "JOIN_CODE")
public class JoinCode {

    @Id
    @Column(name = "JOIN_CODE", length = 100, nullable = false)
    private String joinCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private AppUser user;

    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "EXPIRATION", nullable = false)
    private LocalDateTime expiration;

    @Column(name = "USED_AT")
    private LocalDateTime usedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public JoinCode() {}

    public String getJoinCode()                   { return joinCode; }
    public void   setJoinCode(String joinCode)    { this.joinCode = joinCode; }

    public AppUser getUser()                      { return user; }
    public void    setUser(AppUser user)           { this.user = user; }

    public LocalDateTime getCreatedAt()                    { return createdAt; }
    public void          setCreatedAt(LocalDateTime v)     { this.createdAt = v; }

    public LocalDateTime getExpiration()                   { return expiration; }
    public void          setExpiration(LocalDateTime v)    { this.expiration = v; }

    public LocalDateTime getUsedAt()                       { return usedAt; }
    public void          setUsedAt(LocalDateTime v)        { this.usedAt = v; }

    /** Returns true if the code has not been used and has not expired. */
    public boolean isValid() {
        return usedAt == null && LocalDateTime.now().isBefore(expiration);
    }
}