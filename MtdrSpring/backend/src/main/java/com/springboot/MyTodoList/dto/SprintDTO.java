package com.springboot.MyTodoList.dto;

import com.springboot.MyTodoList.model.Sprint;

public class SprintDTO {
    private String id;
    private String name;
    private String goal;
    private String startDate;
    private String endDate;
    private String status;
    private String projectId;

    public SprintDTO() {}

    public static SprintDTO from(Sprint sprint) {
        SprintDTO dto = new SprintDTO();
        dto.setId(sprint.getId().toString());
        dto.setName(sprint.getName());
        dto.setGoal(sprint.getGoal());
        dto.setStartDate(sprint.getStartDate() != null ? sprint.getStartDate().toString() : null);
        dto.setEndDate(sprint.getEndDate() != null ? sprint.getEndDate().toString() : null);
        dto.setStatus(sprint.getStatus());
        dto.setProjectId(sprint.getProject() != null ? sprint.getProject().getId().toString() : null);
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }
}
