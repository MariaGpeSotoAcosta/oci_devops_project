package com.springboot.MyTodoList.dto;

import com.springboot.MyTodoList.model.Task;

import java.util.List;
import java.util.stream.Collectors;

public class TaskDTO {
    private String id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String type;
    private String assigneeId;
    private Integer storyPoints;
    private String sprintId;
    private String projectId;
    private List<String> tags;
    private List<CommentDTO> comments;
    private Integer workedHours;
    private String createdAt;
    private String updatedAt;
    private String completedAt;
    private String createdBy;

    public TaskDTO() {}

    public static TaskDTO from(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId().toString());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setType(task.getType());
        dto.setAssigneeId(task.getAssignee() != null ? task.getAssignee().getId().toString() : null);
        dto.setStoryPoints(task.getStoryPoints());
        dto.setSprintId(task.getSprint() != null ? task.getSprint().getId().toString() : null);
        dto.setProjectId(task.getProject() != null ? task.getProject().getId().toString() : null);
        dto.setTags(task.getTags());
        dto.setComments(task.getComments() != null
            ? task.getComments().stream().map(CommentDTO::from).collect(Collectors.toList())
            : List.of());
        dto.setWorkedHours(task.getWorkedHours());
        dto.setCreatedAt(task.getCreatedAt() != null ? task.getCreatedAt().toString() : null);
        dto.setUpdatedAt(task.getUpdatedAt() != null ? task.getUpdatedAt().toString() : null);
        dto.setCompletedAt(task.getCompletedAt() != null ? task.getCompletedAt().toString() : null);
        dto.setCreatedBy(task.getCreatedBy() != null ? task.getCreatedBy().getId().toString() : null);
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAssigneeId() { return assigneeId; }
    public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public String getSprintId() { return sprintId; }
    public void setSprintId(String sprintId) { this.sprintId = sprintId; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public List<CommentDTO> getComments() { return comments; }
    public void setComments(List<CommentDTO> comments) { this.comments = comments; }

    public Integer getWorkedHours() { return workedHours; }
    public void setWorkedHours(Integer workedHours) { this.workedHours = workedHours; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
