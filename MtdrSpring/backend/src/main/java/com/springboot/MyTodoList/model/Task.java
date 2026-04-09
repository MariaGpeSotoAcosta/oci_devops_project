package com.springboot.MyTodoList.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "TASKS")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "TITLE", nullable = false, length = 200)
    private String title;

    @Column(name = "DESCRIPTION", length = 2000)
    private String description;

    @Column(name = "TASK_STATUS", length = 20)
    private String status; // "todo", "in-progress", "done"

    @Column(name = "PRIORITY", length = 20)
    private String priority; // "low", "medium", "high", "critical"

    @Column(name = "TASK_TYPE", length = 20)
    private String type; // "story", "task", "bug", "epic"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ASSIGNEE_ID")
    private AppUser assignee;

    @Column(name = "STORY_POINTS")
    private Integer storyPoints;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SPRINT_ID")
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "PROJECT_ID", nullable = false)
    private Project project;

    @Column(name = "TAGS", length = 500)
    private String tagsStr;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<TaskComment> comments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CREATED_BY_ID")
    private AppUser createdBy;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "todo";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Tags stored as comma-separated string in DB
    public List<String> getTags() {
        if (tagsStr == null || tagsStr.isEmpty()) return new ArrayList<>();
        return new ArrayList<>(Arrays.asList(tagsStr.split(",")));
    }

    public void setTags(List<String> tags) {
        this.tagsStr = (tags == null || tags.isEmpty()) ? "" : String.join(",", tags);
    }

    public Task() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public AppUser getAssignee() { return assignee; }
    public void setAssignee(AppUser assignee) { this.assignee = assignee; }

    public Integer getStoryPoints() { return storyPoints; }
    public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }

    public Sprint getSprint() { return sprint; }
    public void setSprint(Sprint sprint) { this.sprint = sprint; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getTagsStr() { return tagsStr; }
    public void setTagsStr(String tagsStr) { this.tagsStr = tagsStr; }

    public List<TaskComment> getComments() { return comments; }
    public void setComments(List<TaskComment> comments) { this.comments = comments; }

    public AppUser getCreatedBy() { return createdBy; }
    public void setCreatedBy(AppUser createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
