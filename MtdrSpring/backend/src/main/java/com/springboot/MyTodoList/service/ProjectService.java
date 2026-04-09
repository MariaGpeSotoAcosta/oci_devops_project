package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.dto.CreateProjectRequest;
import com.springboot.MyTodoList.dto.ProjectDTO;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.TeamMembership;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.ProjectRepository;
import com.springboot.MyTodoList.repository.TeamMembershipRepository;
import com.springboot.MyTodoList.repository.TeamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    @Autowired private ProjectRepository projectRepository;
    @Autowired private TeamRepository teamRepository;
    @Autowired private TeamMembershipRepository membershipRepository;
    @Autowired private AppUserRepository userRepository;

    // ─────────────────────────────────────────────────────────────
    // GET ALL PROJECTS FOR USER
    // ─────────────────────────────────────────────────────────────

    public List<ProjectDTO> getUserProjects(Long userId) {
        log.info("📁 [PROJECT] Fetching all projects for user {}", userId);

        log.debug("🔍 [LOOKUP] Fetching user by ID: {}", userId);
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<TeamMembership> memberships = membershipRepository.findByUser(user);
        List<Team> teams = memberships.stream()
                .map(TeamMembership::getTeam)
                .collect(Collectors.toList());

        if (teams.isEmpty()) {
            log.info("⚠️ [WARN] User {} has no teams — returning empty project list", userId);
            return new ArrayList<>();
        }

        List<Project> projects = projectRepository.findByTeamIn(teams);
        log.info("✅ [SUCCESS] Found {} project(s) for user {}", projects.size(), userId);
        return projects.stream().map(ProjectDTO::from).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // GET PROJECT BY ID
    // ─────────────────────────────────────────────────────────────

    public ProjectDTO getProjectById(Long projectId) {
        log.info("📁 [PROJECT] Fetching project by ID: {}", projectId);

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> {
                    log.error("❌ [ERROR] Project not found with ID: {}", projectId);
                    return new RuntimeException("Project not found");
                });

        log.info("✅ [SUCCESS] Returning project '{}' (ID: {})", project.getName(), projectId);
        return ProjectDTO.from(project);
    }

    // ─────────────────────────────────────────────────────────────
    // CREATE PROJECT
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public ProjectDTO createProject(Long userId, CreateProjectRequest request) {
        log.info("📁 [PROJECT] User {} creating project '{}' (key: '{}') in group '{}'",
                userId, request.getName(), request.getKey(), request.getTeamId());

        Long teamId = Long.parseLong(request.getTeamId());
        log.debug("🔍 [LOOKUP] Fetching group by ID: {}", teamId);
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setKey(request.getKey());
        project.setStatus(request.getStatus() != null ? request.getStatus() : "planning");
        project.setTeam(team);

        log.info("💾 [SAVE] Saving project '{}' in group {} ('{}')", request.getName(), teamId, team.getName());
        Project saved = projectRepository.save(project);
        log.info("✅ [SUCCESS] Project '{}' (ID: {}) created by user {} in group {}",
                saved.getName(), saved.getId(), userId, teamId);
        return ProjectDTO.from(saved);
    }
}
