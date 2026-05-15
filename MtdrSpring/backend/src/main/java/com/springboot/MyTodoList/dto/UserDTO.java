package com.springboot.MyTodoList.dto;

import com.springboot.MyTodoList.model.AppUser;

public class UserDTO {
    private String id;
    private String name;
    private String email;
    private String bio;
    private String avatar;
    private String role;
    private Boolean telegramConnected;
    private String telegramUsername;

    public UserDTO() {}

    /**
     * Build a UserDTO from an AppUser entity.
     * Avatar is derived from name initials (e.g. "John Doe" -> "JD").
     */
    public static UserDTO from(AppUser user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId().toString());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAvatar(buildAvatar(user.getName()));
        dto.setRole(user.getRole() != null ? user.getRole() : "developer");
        dto.setBio(user.getBio());
        dto.setTelegramConnected(user.getTelegramConnected() != null ? user.getTelegramConnected() : false);
        dto.setTelegramUsername(user.getTelegramUsername());
        return dto;
    }

    public static String buildAvatar(String name) {
        if (name == null || name.isEmpty()) return "??";
        String[] parts = name.trim().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) sb.append(Character.toUpperCase(part.charAt(0)));
        }
        return sb.toString();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getTelegramConnected() { return telegramConnected; }
    public void setTelegramConnected(Boolean telegramConnected) { this.telegramConnected = telegramConnected; }

    public String getTelegramUsername() { return telegramUsername; }
    public void setTelegramUsername(String telegramUsername) { this.telegramUsername = telegramUsername; }
}
