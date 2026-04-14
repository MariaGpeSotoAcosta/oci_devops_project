package com.springboot.MyTodoList.dto;

public class WorkedHoursDTO {
    private String week;      // e.g. "2026-W14"
    private String userName;
    private int hours;

    public WorkedHoursDTO(String week, String userName, int hours) {
        this.week = week;
        this.userName = userName;
        this.hours = hours;
    }

    public String getWeek() { return week; }
    public void setWeek(String week) { this.week = week; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public int getHours() { return hours; }
    public void setHours(int hours) { this.hours = hours; }
}
