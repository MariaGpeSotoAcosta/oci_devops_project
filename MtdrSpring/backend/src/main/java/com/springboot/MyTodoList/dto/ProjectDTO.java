package com.springboot.MyTodoList.dto;

import com.springboot.MyTodoList.model.Project;

public class ProjectDTO {
    private String id;
    private String name;
    private String description;
    private String key;
    private String status;
    private String teamId;
    private String createdAt;
    private String updatedAt;

    public ProjectDTO() {}

    public static ProjectDTO from(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId().toString());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setKey(project.getKey());
        dto.setStatus(project.getStatus());
        dto.setTeamId(project.getTeam() != null ? project.getTeam().getId().toString() : null);
        dto.setCreatedAt(project.getCreatedAt() != null ? project.getCreatedAt().toString() : null);
        dto.setUpdatedAt(project.getUpdatedAt() != null ? project.getUpdatedAt().toString() : null);
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
