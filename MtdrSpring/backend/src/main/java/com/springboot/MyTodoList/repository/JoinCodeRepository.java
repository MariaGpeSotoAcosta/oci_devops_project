package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.JoinCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JoinCodeRepository extends JpaRepository<JoinCode, String> {

    /** Find an unused, potentially valid code by its string value. */
    Optional<JoinCode> findByJoinCode(String joinCode);
}