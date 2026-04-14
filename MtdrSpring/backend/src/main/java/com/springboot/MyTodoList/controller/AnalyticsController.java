package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.*;
import com.springboot.MyTodoList.service.AnalyticsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsController.class);

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * GET /api/analytics/velocity?weeks=8
     * Returns tasks created vs completed per ISO week for the last N weeks.
     */
    @GetMapping("/velocity")
    public ResponseEntity<List<VelocityDTO>> getVelocity(
            Authentication auth,
            @RequestParam(defaultValue = "8") int weeks) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /analytics/velocity - User: {} - weeks: {}", userId, weeks);
        try {
            List<VelocityDTO> result = analyticsService.getVelocity(userId, weeks);
            log.info("✅ [SUCCESS] GET /analytics/velocity - {} data points returned for user {}", result.size(), userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /analytics/velocity - Failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/priority
     * Returns task count grouped by priority level.
     */
    @GetMapping("/priority")
    public ResponseEntity<List<PriorityDistributionDTO>> getPriorityDistribution(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /analytics/priority - User: {}", userId);
        try {
            List<PriorityDistributionDTO> result = analyticsService.getPriorityDistribution(userId);
            log.info("✅ [SUCCESS] GET /analytics/priority - {} priority buckets for user {}", result.size(), userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /analytics/priority - Failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/worked-hours?weeks=8
     * Returns sum of worked hours per user per ISO week.
     */
    @GetMapping("/worked-hours")
    public ResponseEntity<List<WorkedHoursDTO>> getWorkedHours(
            Authentication auth,
            @RequestParam(defaultValue = "8") int weeks) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /analytics/worked-hours - User: {} - weeks: {}", userId, weeks);
        try {
            List<WorkedHoursDTO> result = analyticsService.getWorkedHoursPerUser(userId, weeks);
            log.info("✅ [SUCCESS] GET /analytics/worked-hours - {} entries for user {}", result.size(), userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /analytics/worked-hours - Failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/analytics/task-distribution
     * Returns task count per team member as percentages.
     */
    @GetMapping("/task-distribution")
    public ResponseEntity<List<TaskDistributionDTO>> getTaskDistribution(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        log.info("🚀 [REQUEST] GET /analytics/task-distribution - User: {}", userId);
        try {
            List<TaskDistributionDTO> result = analyticsService.getTaskDistribution(userId);
            log.info("✅ [SUCCESS] GET /analytics/task-distribution - {} members for user {}", result.size(), userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("❌ [ERROR] GET /analytics/task-distribution - Failed for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
