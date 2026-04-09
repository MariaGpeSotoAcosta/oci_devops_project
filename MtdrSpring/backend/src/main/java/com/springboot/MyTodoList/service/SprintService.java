package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.dto.CreateSprintRequest;
import com.springboot.MyTodoList.dto.SprintDTO;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.TeamMembership;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.ProjectRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TeamMembershipRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SprintService {

    private static final Logger log = LoggerFactory.getLogger(SprintService.class);

    @Autowired private SprintRepository sprintRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private TeamMembershipRepository membershipRepository;
    @Autowired private AppUserRepository userRepository;

    // ─────────────────────────────────────────────────────────────
    // GET SPRINTS BY PROJECT
    // ─────────────────────────────────────────────────────────────

    public List<SprintDTO> getSprintsByProject(Long projectId) {
        log.info("🏃 [SPRINT] Fetching sprints for project {}", projectId);
        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
        log.info("✅ [SUCCESS] Found {} sprint(s) for project {}", sprints.size(), projectId);
        return sprints.stream().map(SprintDTO::from).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // GET ALL SPRINTS FOR USER (across all their teams/projects)
    // ─────────────────────────────────────────────────────────────

    public List<SprintDTO> getSprintsByUser(Long userId) {
        log.info("🏃 [SPRINT] Fetching all sprints for user {}", userId);

        log.debug("🔍 [LOOKUP] Fetching user by ID: {}", userId);
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<TeamMembership> memberships = membershipRepository.findByUser(user);
        List<Team> teams = memberships.stream()
                .map(TeamMembership::getTeam)
                .collect(Collectors.toList());

        if (teams.isEmpty()) {
            log.info("⚠️ [WARN] User {} has no teams — returning empty sprint list", userId);
            return List.of();
        }

        List<Project> projects = projectRepository.findByTeamIn(teams);
        if (projects.isEmpty()) {
            log.info("⚠️ [WARN] User {} has no projects — returning empty sprint list", userId);
            return List.of();
        }

        List<Sprint> sprints = sprintRepository.findByProjectIn(projects);
        log.info("✅ [SUCCESS] Found {} sprint(s) for user {} across {} project(s)",
                sprints.size(), userId, projects.size());
        return sprints.stream().map(SprintDTO::from).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // CREATE SPRINT
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public SprintDTO createSprint(Long userId, CreateSprintRequest request) {
        log.info("🏃 [SPRINT] User {} creating sprint '{}' for project '{}'",
                userId, request.getName(), request.getProjectId());

        Long projectId = Long.parseLong(request.getProjectId());
        log.debug("🔍 [LOOKUP] Fetching project by ID: {}", projectId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found: " + projectId));

        Sprint sprint = new Sprint();
        sprint.setName(request.getName());
        sprint.setGoal(request.getGoal());
        sprint.setStatus(request.getStatus() != null ? request.getStatus() : "planning");
        sprint.setProject(project);

        if (request.getStartDate() != null && !request.getStartDate().isBlank()) {
            try {
                sprint.setStartDate(LocalDate.parse(request.getStartDate().substring(0, 10)));
                log.debug("📅 [DATE] Sprint start date set to: {}", sprint.getStartDate());
            } catch (Exception e) {
                log.warn("⚠️ [WARN] Could not parse startDate '{}': {}", request.getStartDate(), e.getMessage());
            }
        }

        if (request.getEndDate() != null && !request.getEndDate().isBlank()) {
            try {
                sprint.setEndDate(LocalDate.parse(request.getEndDate().substring(0, 10)));
                log.debug("📅 [DATE] Sprint end date set to: {}", sprint.getEndDate());
            } catch (Exception e) {
                log.warn("⚠️ [WARN] Could not parse endDate '{}': {}", request.getEndDate(), e.getMessage());
            }
        }

        log.info("💾 [SAVE] Saving sprint '{}' for project {} ('{}')",
                request.getName(), projectId, project.getName());
        Sprint saved = sprintRepository.save(sprint);
        log.info("✅ [SUCCESS] Sprint '{}' created (ID: {}) for project {}", saved.getName(), saved.getId(), projectId);
        return SprintDTO.from(saved);
    }
}
