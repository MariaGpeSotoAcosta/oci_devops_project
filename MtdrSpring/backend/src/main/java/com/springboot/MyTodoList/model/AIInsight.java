package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_insights")
public class AIInsight {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String week; // Format: "2026-W17"

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content; // Markdown content

    @Column(nullable = false)
    private LocalDateTime generatedAt;

    // Constructors
    public AIInsight() {
    }

    public AIInsight(String week, String content, LocalDateTime generatedAt) {
        this.week = week;
        this.content = content;
        this.generatedAt = generatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getWeek() {
        return week;
    }

    public void setWeek(String week) {
        this.week = week;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
}