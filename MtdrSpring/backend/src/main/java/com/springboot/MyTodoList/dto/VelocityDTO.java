package com.springboot.MyTodoList.dto;

public class VelocityDTO {
    private String week;   // e.g. "2026-W14"
    private int created;
    private int completed;

    public VelocityDTO(String week, int created, int completed) {
        this.week = week;
        this.created = created;
        this.completed = completed;
    }

    public String getWeek() { return week; }
    public void setWeek(String week) { this.week = week; }

    public int getCreated() { return created; }
    public void setCreated(int created) { this.created = created; }

    public int getCompleted() { return completed; }
    public void setCompleted(int completed) { this.completed = completed; }
}
