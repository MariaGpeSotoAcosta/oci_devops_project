package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.dto.*;
import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.Sprint;
import com.springboot.MyTodoList.model.Task;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.TeamMembership;
import com.springboot.MyTodoList.repository.AppUserRepository;
import com.springboot.MyTodoList.repository.ProjectRepository;
import com.springboot.MyTodoList.repository.SprintRepository;
import com.springboot.MyTodoList.repository.TaskRepository;
import com.springboot.MyTodoList.repository.TeamMembershipRepository;
import com.springboot.MyTodoList.repository.TeamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class TeamService {

    private static final Logger log = LoggerFactory.getLogger(TeamService.class);

    @Autowired private TeamRepository teamRepository;
    @Autowired private TeamMembershipRepository membershipRepository;
    @Autowired private AppUserRepository userRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private SprintRepository sprintRepository;

    // ─────────────────────────────────────────────────────────────
    // CREATE TEAM
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public CreateTeamResponse createTeam(Long userId, CreateTeamRequest request) {
        log.info("👥 [TEAM] User {} creating group '{}'", userId, request.getName());

        log.debug("🔍 [LOOKUP] Fetching user by ID: {}", userId);
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        String joinCode = generateJoinCode();
        log.debug("🔑 [CODE] Generated join code '{}' for new group: {}", joinCode, request.getName());

        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setJoinCode(joinCode);

        log.info("💾 [SAVE] Saving new group: '{}'", request.getName());
        Team saved = teamRepository.save(team);
        log.info("✅ [SUCCESS] Group '{}' saved (ID: {})", saved.getName(), saved.getId());

        TeamMembership membership = new TeamMembership();
        membership.setUser(user);
        membership.setTeam(saved);
        membership.setRole("admin");
        membershipRepository.save(membership);
        log.info("👤 [MEMBER] User {} added to group {} as admin", userId, saved.getId());

        TeamDTO dto = buildTeamDTO(saved);
        log.info("✅ [SUCCESS] Group '{}' created by user {} (join code: {})", saved.getName(), userId, joinCode);
        return new CreateTeamResponse(dto, joinCode);
    }

    // ─────────────────────────────────────────────────────────────
    // JOIN TEAM
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public JoinTeamResponse joinTeam(Long userId, JoinTeamRequest request) {
        String code = request.getJoinCode() != null ? request.getJoinCode().toUpperCase() : "";
        log.info("👥 [TEAM] User {} attempting to join group with code '{}'", userId, code);

        if (code.length() != 6) {
            log.warn("⚠️ [WARN] Invalid join code format '{}' from user {}", code, userId);
            throw new RuntimeException("Join code must be exactly 6 characters");
        }

        log.debug("🔍 [LOOKUP] Fetching user by ID: {}", userId);
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        log.debug("🔍 [LOOKUP] Looking up group by join code: {}", code);
        Team team = teamRepository.findByJoinCode(code)
                .orElseThrow(() -> {
                    log.error("❌ [ERROR] Invalid join code '{}' — no matching group", code);
                    return new RuntimeException("Invalid join code");
                });

        if (membershipRepository.existsByUserAndTeam(user, team)) {
            log.warn("⚠️ [WARN] User {} is already a member of group {} ('{}')", userId, team.getId(), team.getName());
            TeamDTO dto = buildTeamDTO(team);
            return new JoinTeamResponse(dto, true);
        }

        // Snapshot members BEFORE adding the joining user to avoid duplicates on frontend
        List<TeamMembership> existingMemberships = membershipRepository.findByTeam(team);

        TeamMembership membership = new TeamMembership();
        membership.setUser(user);
        membership.setTeam(team);
        membership.setRole("developer");
        membershipRepository.save(membership);
        log.info("✅ [SUCCESS] User {} joined group {} ('{}') as developer", userId, team.getId(), team.getName());

        List<TeamMemberDTO> memberDTOs = existingMemberships.stream()
                .map(m -> TeamMemberDTO.from(m.getUser(), m.getRole()))
                .collect(Collectors.toList());

        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId().toString());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setJoinCode(team.getJoinCode());
        dto.setCreatedAt(team.getCreatedAt() != null ? team.getCreatedAt().toString() : null);
        dto.setMembers(memberDTOs);

        return new JoinTeamResponse(dto, true);
    }

    // ─────────────────────────────────────────────────────────────
    // GET USER'S TEAMS
    // ─────────────────────────────────────────────────────────────

    public List<TeamDTO> getUserTeams(Long userId) {
        log.info("👥 [TEAM] Fetching all groups for user {}", userId);

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        List<TeamMembership> memberships = membershipRepository.findByUser(user);
        log.info("✅ [SUCCESS] User {} belongs to {} group(s)", userId, memberships.size());

        return memberships.stream()
                .map(m -> buildTeamDTO(m.getTeam()))
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // GET TEAM BY ID
    // ─────────────────────────────────────────────────────────────

    public TeamDTO getTeamById(Long teamId) {
        log.info("👥 [TEAM] Fetching group by ID: {}", teamId);

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> {
                    log.error("❌ [ERROR] Group not found with ID: {}", teamId);
                    return new RuntimeException("Team not found");
                });

        log.info("✅ [SUCCESS] Returning group '{}' (ID: {})", team.getName(), teamId);
        return buildTeamDTO(team);
    }

    // ─────────────────────────────────────────────────────────────
    // GET TEAM MEMBERS
    // ─────────────────────────────────────────────────────────────

    public List<TeamMemberDTO> getTeamMembers(Long teamId) {
        log.info("👥 [TEAM] Fetching members for group {}", teamId);

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> {
                    log.error("❌ [ERROR] Group not found with ID: {}", teamId);
                    return new RuntimeException("Team not found: " + teamId);
                });

        List<TeamMembership> memberships = membershipRepository.findByTeam(team);
        log.info("✅ [SUCCESS] Found {} member(s) in group {} ('{}')", memberships.size(), teamId, team.getName());

        return memberships.stream()
                .map(m -> TeamMemberDTO.from(m.getUser(), m.getRole()))
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // GET TEAM TASKS
    // ─────────────────────────────────────────────────────────────

    public List<TaskDTO> getTeamTasks(Long teamId) {
        log.info("📋 [TASK] Fetching all tasks for group {}", teamId);

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> {
                    log.error("❌ [ERROR] Group not found with ID: {}", teamId);
                    return new RuntimeException("Team not found");
                });

        List<Project> projects = projectRepository.findByTeam(team);
        log.debug("🔍 [LOOKUP] Found {} project(s) in group {}", projects.size(), teamId);

        if (projects.isEmpty()) {
            log.info("⚠️ [WARN] Group {} has no projects — returning empty task list", teamId);
            return List.of();
        }

        List<Task> tasks = taskRepository.findByProjectIn(projects);
        log.info("✅ [SUCCESS] Found {} task(s) for group {}", tasks.size(), teamId);
        return tasks.stream().map(TaskDTO::from).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // GET TEAM SPRINTS
    // ─────────────────────────────────────────────────────────────

    public List<SprintDTO> getTeamSprints(Long teamId) {
        log.info("🏃 [SPRINT] Fetching all sprints for group {}", teamId);

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> {
                    log.error("❌ [ERROR] Group not found with ID: {}", teamId);
                    return new RuntimeException("Team not found");
                });

        List<Project> projects = projectRepository.findByTeam(team);
        log.debug("🔍 [LOOKUP] Found {} project(s) in group {}", projects.size(), teamId);

        if (projects.isEmpty()) {
            log.info("⚠️ [WARN] Group {} has no projects — returning empty sprint list", teamId);
            return List.of();
        }

        List<Sprint> sprints = sprintRepository.findByProjectIn(projects);
        log.info("✅ [SUCCESS] Found {} sprint(s) for group {}", sprints.size(), teamId);
        return sprints.stream().map(SprintDTO::from).collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // INVITE MEMBER
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public TeamMemberDTO inviteMember(Long teamId, InviteMemberRequest request) {
        log.info("👤 [MEMBER] Inviting '{}' to group {} with role '{}'",
                request.getEmail(), teamId, request.getRole());

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));

        log.debug("🔍 [LOOKUP] Fetching user by email: {}", request.getEmail());
        AppUser user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.error("❌ [ERROR] Cannot invite — no user found with email: {}", request.getEmail());
                    return new RuntimeException("User not found with email: " + request.getEmail());
                });

        if (membershipRepository.existsByUserAndTeam(user, team)) {
            log.warn("⚠️ [WARN] User {} ({}) is already a member of group {}",
                    user.getId(), request.getEmail(), teamId);
            throw new RuntimeException("User is already a member of this team");
        }

        String role = request.getRole() != null ? request.getRole() : "developer";
        TeamMembership membership = new TeamMembership();
        membership.setUser(user);
        membership.setTeam(team);
        membership.setRole(role);
        membershipRepository.save(membership);
        log.info("✅ [SUCCESS] User {} ({}) added to group {} as '{}'",
                user.getId(), request.getEmail(), teamId, role);

        return TeamMemberDTO.from(user, role);
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    private TeamDTO buildTeamDTO(Team team) {
        List<TeamMembership> memberships = membershipRepository.findByTeam(team);
        List<TeamMemberDTO> members = memberships.stream()
                .map(m -> TeamMemberDTO.from(m.getUser(), m.getRole()))
                .collect(Collectors.toList());

        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId().toString());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setJoinCode(team.getJoinCode());
        dto.setCreatedAt(team.getCreatedAt() != null ? team.getCreatedAt().toString() : null);
        dto.setMembers(members);
        return dto;
    }

    private String generateJoinCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
