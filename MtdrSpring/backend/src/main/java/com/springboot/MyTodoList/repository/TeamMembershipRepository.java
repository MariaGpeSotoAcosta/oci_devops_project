package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.AppUser;
import com.springboot.MyTodoList.model.Team;
import com.springboot.MyTodoList.model.TeamMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMembershipRepository extends JpaRepository<TeamMembership, Long> {
    List<TeamMembership> findByTeam(Team team);
    List<TeamMembership> findByUser(AppUser user);
    Optional<TeamMembership> findByUserAndTeam(AppUser user, Team team);
    boolean existsByUserAndTeam(AppUser user, Team team);
}
