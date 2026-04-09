package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.CreateProjectRequest;
import com.springboot.MyTodoList.dto.ProjectDTO;
import com.springboot.MyTodoList.service.ProjectService;
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
}
