package com.springboot.MyTodoList.dto;

import java.util.List;

public class TeamDTO {
    private String id;
    private String name;
    private String description;
    private List<TeamMemberDTO> members;
    private String joinCode;
    private String createdAt;

    public TeamDTO() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<TeamMemberDTO> getMembers() { return members; }
    public void setMembers(List<TeamMemberDTO> members) { this.members = members; }

    public String getJoinCode() { return joinCode; }
    public void setJoinCode(String joinCode) { this.joinCode = joinCode; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
