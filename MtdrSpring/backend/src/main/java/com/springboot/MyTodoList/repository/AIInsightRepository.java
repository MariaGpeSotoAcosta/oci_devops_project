package com.springboot.MyTodoList.repository;

import com.springboot.MyTodoList.model.AIInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIInsightRepository extends JpaRepository<AIInsight, Long> {
    
    /**
     * Find insight by week string
     */
    Optional<AIInsight> findByWeek(String week);
    
    /**
     * Find all insights ordered by week descending
     */
    List<AIInsight> findAllByOrderByWeekDesc();
    
    /**
     * Check if insight exists for a given week
     */
    boolean existsByWeek(String week);
}