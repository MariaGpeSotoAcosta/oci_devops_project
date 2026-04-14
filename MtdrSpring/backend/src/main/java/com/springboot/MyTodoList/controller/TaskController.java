package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.CreateTaskRequest;
import com.springboot.MyTodoList.dto.TaskDTO;
import com.springboot.MyTodoList.dto.UpdateTaskRequest;
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
@RequestMapping("/api/tasks")
public class TaskController {

    private static final Logger log = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    private TaskService taskService;

    /**
     * GET /api/tasks?projectId=&sprintId=&assigneeId=&status=
     */
    @GetMapping
    public ResponseEntity<List<TaskDTO>> getTasks(
            Authentication auth,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String sprintId,
            @RequestParam(required = false) String assigneeId,
            @RequestParam(required = false) String status) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /tasks - User: {} - Filters: projectId={}, sprintId={}, assigneeId={}, status={}",
                userId, projectId, sprintId, assigneeId, status);
        try {
            List<TaskDTO> tasks = taskService.getTasks(userId, projectId, sprintId, assigneeId, status);
            log.info("✅ [SUCCESS] GET /tasks - Returning {} task(s) for user {}", tasks.size(), userId);
            return ResponseEntity.ok(tasks);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /tasks - Failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/tasks/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /tasks/{} - User: {}", id, userId);
        try {
            TaskDTO task = taskService.getTaskById(id);
            log.info("✅ [SUCCESS] GET /tasks/{} - Returning task '{}'", id, task.getTitle());
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /tasks/{} - Task not found: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * POST /api/tasks
     */
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(Authentication auth,
                                               @RequestBody CreateTaskRequest request) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] POST /tasks - User: {} - title: '{}', projectId: '{}', priority: '{}', type: '{}'",
                userId, request.getTitle(), request.getProjectId(), request.getPriority(), request.getType());
        try {
            TaskDTO task = taskService.createTask(userId, request);
            log.info("✅ [SUCCESS] POST /tasks - Task '{}' created (ID: {}) by user {}", task.getTitle(), task.getId(), userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(task);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] POST /tasks - Task creation failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * PUT /api/tasks/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(Authentication auth,
                                               @PathVariable Long id,
                                               @RequestBody UpdateTaskRequest request) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] PUT /tasks/{} - User: {}", id, userId);
        try {
            TaskDTO task = taskService.updateTask(userId, id, request);
            log.info("✅ [SUCCESS] PUT /tasks/{} - Task updated successfully", id);
            return ResponseEntity.ok(task);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] PUT /tasks/{} - Update failed for user {}: {}", id, userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * DELETE /api/tasks/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] DELETE /tasks/{} - User: {}", id, userId);
        try {
            taskService.deleteTask(userId, id);
            log.info("✅ [SUCCESS] DELETE /tasks/{} - Task deleted successfully", id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] DELETE /tasks/{} - Delete failed for user {}: {}", id, userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
