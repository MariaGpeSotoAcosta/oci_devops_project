package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.Project;
import com.springboot.MyTodoList.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByTeam(Team team);
    List<Project> findByTeamIn(List<Team> teams);
}
