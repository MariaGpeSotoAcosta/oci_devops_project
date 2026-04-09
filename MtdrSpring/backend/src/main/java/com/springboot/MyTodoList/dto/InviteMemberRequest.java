package com.springboot.MyTodoList.dto;

public class InviteMemberRequest {
    private String email;
    private String role;

    public InviteMemberRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
