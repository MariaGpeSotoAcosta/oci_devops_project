package com.springboot.MyTodoList.dto;

import com.springboot.MyTodoList.model.AppUser;

public class TeamMemberDTO {
    private String id;
    private String name;
    private String email;
    private String avatar;
    private String role;

    public TeamMemberDTO() {}

    public static TeamMemberDTO from(AppUser user, String role) {
        TeamMemberDTO dto = new TeamMemberDTO();
        dto.setId(user.getId().toString());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAvatar(UserDTO.buildAvatar(user.getName()));
        dto.setRole(role != null ? role : "developer");
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
