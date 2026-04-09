package com.springboot.MyTodoList.dto;

import com.springboot.MyTodoList.model.TaskComment;

public class CommentDTO {
    private String id;
    private String userId;
    private String userName;
    private String content;
    private String createdAt;

    public CommentDTO() {}

    public static CommentDTO from(TaskComment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId().toString());
        dto.setUserId(comment.getUser().getId().toString());
        dto.setUserName(comment.getUser().getName());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null);
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
