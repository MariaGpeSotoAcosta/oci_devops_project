package com.springboot.MyTodoList.dto;

public class SprintKpiDTO {
    private String sprintId;
    private String sprintName;
    private String projectId;
    private String projectName;
    private int totalTasks;
    private int completedTasks;
    private int totalHoursWorked;
    private int totalHoursEstimated;
    private double completionRate;

    public SprintKpiDTO() {}

    public SprintKpiDTO(String sprintId, String sprintName, String projectId, String projectName,
                        int totalTasks, int completedTasks, int totalHoursWorked,
                        int totalHoursEstimated, double completionRate) {
        this.sprintId = sprintId;
        this.sprintName = sprintName;
        this.projectId = projectId;
        this.projectName = projectName;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.totalHoursWorked = totalHoursWorked;
        this.totalHoursEstimated = totalHoursEstimated;
        this.completionRate = completionRate;
    }

    public String getSprintId()                         { return sprintId; }
    public void   setSprintId(String sprintId)          { this.sprintId = sprintId; }

    public String getSprintName()                       { return sprintName; }
    public void   setSprintName(String sprintName)      { this.sprintName = sprintName; }

    public String getProjectId()                        { return projectId; }
    public void   setProjectId(String projectId)        { this.projectId = projectId; }

    public String getProjectName()                      { return projectName; }
    public void   setProjectName(String projectName)    { this.projectName = projectName; }

    public int    getTotalTasks()                       { return totalTasks; }
    public void   setTotalTasks(int totalTasks)         { this.totalTasks = totalTasks; }

    public int    getCompletedTasks()                   { return completedTasks; }
    public void   setCompletedTasks(int completedTasks) { this.completedTasks = completedTasks; }

    public int    getTotalHoursWorked()                         { return totalHoursWorked; }
    public void   setTotalHoursWorked(int totalHoursWorked)     { this.totalHoursWorked = totalHoursWorked; }

    public int    getTotalHoursEstimated()                          { return totalHoursEstimated; }
    public void   setTotalHoursEstimated(int totalHoursEstimated)   { this.totalHoursEstimated = totalHoursEstimated; }

    public double getCompletionRate()                           { return completionRate; }
    public void   setCompletionRate(double completionRate)      { this.completionRate = completionRate; }
}
