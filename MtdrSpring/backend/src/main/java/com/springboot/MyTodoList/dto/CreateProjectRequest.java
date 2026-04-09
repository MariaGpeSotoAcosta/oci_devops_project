package com.springboot.MyTodoList.dto;

public class CreateProjectRequest {
    private String name;
    private String description;
    private String key;
    private String status;
    private String teamId;

    public CreateProjectRequest() {}

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
}
