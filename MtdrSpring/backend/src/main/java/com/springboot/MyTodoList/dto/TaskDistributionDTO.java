package com.springboot.MyTodoList.dto;

public class TaskDistributionDTO {
    private String userId;
    private String userName;
    private int taskCount;
    private double percentage;

    public TaskDistributionDTO(String userId, String userName, int taskCount, double percentage) {
        this.userId = userId;
        this.userName = userName;
        this.taskCount = taskCount;
        this.percentage = percentage;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public int getTaskCount() { return taskCount; }
    public void setTaskCount(int taskCount) { this.taskCount = taskCount; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
}
