package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.CreateProjectRequest;
import com.springboot.MyTodoList.dto.ProjectDTO;
import com.springboot.MyTodoList.dto.TaskDTO;
import com.springboot.MyTodoList.dto.UpdateProjectRequest;
import com.springboot.MyTodoList.service.ProjectService;
import com.springboot.MyTodoList.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private static final Logger log = LoggerFactory.getLogger(ProjectController.class);

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TaskService taskService;

    /**
     * GET /api/projects
     */
    @GetMapping
    public ResponseEntity<List<ProjectDTO>> getProjects(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /projects - User: {}", userId);
        try {
            List<ProjectDTO> projects = projectService.getUserProjects(userId);
            log.info("✅ [SUCCESS] GET /projects - Returning {} project(s) for user {}", projects.size(), userId);
            return ResponseEntity.ok(projects);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /projects - Failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/projects/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /projects/{} - User: {}", id, userId);
        try {
            ProjectDTO project = projectService.getProjectById(id);
            log.info("✅ [SUCCESS] GET /projects/{} - Returning project '{}'", id, project.getName());
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /projects/{} - Project not found: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * POST /api/projects
     */
    @PostMapping
    public ResponseEntity<ProjectDTO> createProject(Authentication auth,
                                                     @RequestBody CreateProjectRequest request) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] POST /projects - User: {} - name: '{}', key: '{}', teamId: '{}'",
                userId, request.getName(), request.getKey(), request.getTeamId());
        try {
            ProjectDTO project = projectService.createProject(userId, request);
            log.info("✅ [SUCCESS] POST /projects - Project '{}' (ID: {}) created by user {}", project.getName(), project.getId(), userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(project);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] POST /projects - Project creation failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET /api/projects/{id}/tasks
     * Get all tasks for a specific project.
     */
    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<TaskDTO>> getProjectTasks(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /projects/{}/tasks - User: {}", id, userId);
        try {
            List<TaskDTO> tasks = taskService.getTasks(userId, id.toString(), null, null, null);
            log.info("✅ [SUCCESS] GET /projects/{}/tasks - Returning {} task(s)", id, tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /projects/{}/tasks - Failed for user {}: {}", id, userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * PUT /api/projects/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDTO> updateProject(Authentication auth,
                                                     @PathVariable Long id,
                                                     @RequestBody UpdateProjectRequest request) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] PUT /projects/{} - User: {}", id, userId);
        try {
            ProjectDTO project = projectService.updateProject(userId, id, request);
            log.info("✅ [SUCCESS] PUT /projects/{} - Project updated successfully", id);
            return ResponseEntity.ok(project);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] PUT /projects/{} - Update failed for user {}: {}", id, userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * DELETE /api/projects/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] DELETE /projects/{} - User: {}", id, userId);
        try {
            projectService.deleteProject(userId, id);
            log.info("✅ [SUCCESS] DELETE /projects/{} - Project deleted successfully", id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] DELETE /projects/{} - Delete failed for user {}: {}", id, userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
