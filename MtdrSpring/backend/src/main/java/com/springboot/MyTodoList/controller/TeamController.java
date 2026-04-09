package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.*;
import com.springboot.MyTodoList.service.TeamService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private static final Logger log = LoggerFactory.getLogger(TeamController.class);

    @Autowired
    private TeamService teamService;

    /**
     * POST /api/teams/create
     */
    @PostMapping("/create")
    public ResponseEntity<CreateTeamResponse> createTeam(Authentication auth,
                                                          @RequestBody CreateTeamRequest request) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] POST /teams/create - User: {} - Creating group '{}'", userId, request.getName());
        try {
            CreateTeamResponse response = teamService.createTeam(userId, request);
            log.info("✅ [SUCCESS] POST /teams/create - Group '{}' created by user {}", request.getName(), userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] POST /teams/create - Group creation failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * POST /api/teams/join
     */
    @PostMapping("/join")
    public ResponseEntity<JoinTeamResponse> joinTeam(Authentication auth,
                                                      @RequestBody JoinTeamRequest request) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] POST /teams/join - User: {} - Join code: '{}'", userId, request.getJoinCode());
        try {
            JoinTeamResponse response = teamService.joinTeam(userId, request);
            log.info("✅ [SUCCESS] POST /teams/join - User {} joined group '{}'", userId, response.getTeam().getName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] POST /teams/join - Join failed for user {} with code '{}': {}",
                    userId, request.getJoinCode(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET /api/teams
     */
    @GetMapping
    public ResponseEntity<List<TeamDTO>> getTeams(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /teams - User: {}", userId);
        try {
            List<TeamDTO> teams = teamService.getUserTeams(userId);
            log.info("✅ [SUCCESS] GET /teams - Returning {} group(s) for user {}", teams.size(), userId);
            return ResponseEntity.ok(teams);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /teams - Failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/teams/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeamById(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /teams/{} - User: {}", id, userId);
        try {
            TeamDTO team = teamService.getTeamById(id);
            log.info("✅ [SUCCESS] GET /teams/{} - Returning group '{}'", id, team.getName());
            return ResponseEntity.ok(team);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /teams/{} - Group not found: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * GET /api/teams/{id}/tasks
     * Get all tasks for projects belonging to this team.
     */
    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<TaskDTO>> getTeamTasks(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /teams/{}/tasks - User: {}", id, userId);
        try {
            List<TaskDTO> tasks = teamService.getTeamTasks(id);
            log.info("✅ [SUCCESS] GET /teams/{}/tasks - Returning {} task(s)", id, tasks.size());
            return ResponseEntity.ok(tasks);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /teams/{}/tasks - Failed: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/teams/{id}/sprints
     * Get all sprints for projects belonging to this team.
     */
    @GetMapping("/{id}/sprints")
    public ResponseEntity<List<SprintDTO>> getTeamSprints(Authentication auth, @PathVariable Long id) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /teams/{}/sprints - User: {}", id, userId);
        try {
            List<SprintDTO> sprints = teamService.getTeamSprints(id);
            log.info("✅ [SUCCESS] GET /teams/{}/sprints - Returning {} sprint(s)", id, sprints.size());
            return ResponseEntity.ok(sprints);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /teams/{}/sprints - Failed: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/teams/{id}/invite
     */
    @PostMapping("/{id}/invite")
    public ResponseEntity<TeamMemberDTO> inviteMember(Authentication auth,
                                                       @PathVariable Long id,
                                                       @RequestBody InviteMemberRequest request) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] POST /teams/{}/invite - User: {} - Inviting email: '{}' with role: '{}'",
                id, userId, request.getEmail(), request.getRole());
        try {
            TeamMemberDTO member = teamService.inviteMember(id, request);
            log.info("✅ [SUCCESS] POST /teams/{}/invite - '{}' invited by user {}", id, request.getEmail(), userId);
            return ResponseEntity.ok(member);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] POST /teams/{}/invite - Invite failed for user {}: {}", id, userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
