package com.springboot.MyTodoList.dto;

public class AIInsightDTO {
    private String week;
    private String content;
    private String generatedAt;

    // Constructors
    public AIInsightDTO() {
    }

    public AIInsightDTO(String week, String content, String generatedAt) {
        this.week = week;
        this.content = content;
        this.generatedAt = generatedAt;
    }

    // Getters and Setters
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

    public String getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(String generatedAt) {
        this.generatedAt = generatedAt;
    }
}