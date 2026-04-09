package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.CreateSprintRequest;
import com.springboot.MyTodoList.dto.SprintDTO;
import com.springboot.MyTodoList.service.SprintService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    private static final Logger log = LoggerFactory.getLogger(SprintController.class);

    @Autowired
    private SprintService sprintService;

    /**
     * GET /api/sprints?projectId={projectId}
     * If no projectId given, returns all sprints for the user's projects.
     */
    @GetMapping
    public ResponseEntity<List<SprintDTO>> getSprints(Authentication auth,
                                                       @RequestParam(required = false) String projectId) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /sprints - User: {} - projectId: {}", userId, projectId);
        try {
            List<SprintDTO> sprints = (projectId != null && !projectId.isBlank())
                    ? sprintService.getSprintsByProject(Long.parseLong(projectId))
                    : sprintService.getSprintsByUser(userId);
            log.info("✅ [SUCCESS] GET /sprints - Returning {} sprint(s) for user {}", sprints.size(), userId);
            return ResponseEntity.ok(sprints);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /sprints - Failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/sprints
     */
    @PostMapping
    public ResponseEntity<SprintDTO> createSprint(Authentication auth,
                                                   @RequestBody CreateSprintRequest request) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] POST /sprints - User: {} - name: '{}', projectId: '{}'",
                userId, request.getName(), request.getProjectId());
        try {
            SprintDTO sprint = sprintService.createSprint(userId, request);
            log.info("✅ [SUCCESS] POST /sprints - Sprint '{}' (ID: {}) created by user {}", sprint.getName(), sprint.getId(), userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(sprint);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] POST /sprints - Sprint creation failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
