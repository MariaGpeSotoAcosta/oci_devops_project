package com.springboot.MyTodoList.model;

import jakarta.persistence.*;

@Entity
@Table(name = "TEAM_MEMBERSHIPS",
    uniqueConstraints = @UniqueConstraint(columnNames = {"USER_ID", "TEAM_ID"}))
public class TeamMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TEAM_ID", nullable = false)
    private Team team;

    @Column(name = "ROLE", length = 20)
    private String role; // "admin", "developer", "viewer"

    public TeamMembership() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public Team getTeam() { return team; }
    public void setTeam(Team team) { this.team = team; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
