package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.dto.AIInsightDTO;
import com.springboot.MyTodoList.model.AIInsight;
import com.springboot.MyTodoList.repository.AIInsightRepository;
import com.springboot.MyTodoList.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class AIInsightsService {

    @Autowired
    private AIInsightRepository aiInsightRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private KPIAnalysisService kpiAnalysisService; // Service that analyzes your KPI data

    /**
     * Get all insights ordered by week descending
     */
    public List<AIInsightDTO> getAllInsights() {
        return aiInsightRepository.findAllByOrderByWeekDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get insight for a specific week
     */
    public AIInsightDTO getInsightByWeek(String week) {
        return aiInsightRepository.findByWeek(week)
                .map(this::convertToDTO)
                .orElse(null);
    }

    /**
     * Generate new AI insight based on current KPI data
     */
    public AIInsightDTO generateNewInsight() {
        // Get current week
        LocalDateTime now = LocalDateTime.now();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        int weekNumber = now.get(weekFields.weekOfWeekBasedYear());
        int year = now.get(weekFields.weekBasedYear());
        String weekString = String.format("%d-W%02d", year, weekNumber);

        // Analyze KPIs and generate insights
        String markdownContent = generateInsightContent();

        // Save to database
        AIInsight insight = new AIInsight();
        insight.setWeek(weekString);
        insight.setContent(markdownContent);
        insight.setGeneratedAt(now);

        AIInsight saved = aiInsightRepository.save(insight);
        return convertToDTO(saved);
    }

    /**
     * Generate markdown content with 3 main insights based on KPI analysis
     */
    private String generateInsightContent() {
        // Fetch KPI data
        var velocityData = kpiAnalysisService.getVelocityTrends();
        var priorityData = kpiAnalysisService.getPriorityDistribution();
        var workloadData = kpiAnalysisService.getWorkloadDistribution();

        StringBuilder markdown = new StringBuilder();
        
        markdown.append("# Weekly Team Performance Insights\n\n");
        markdown.append("Based on your team's KPI data, here are three key areas to focus on:\n\n");


        // Aqui hacer la Logica de llamar al LLM

        return markdown.toString();
    }

    /**
     * Convert entity to DTO
     */
    private AIInsightDTO convertToDTO(AIInsight insight) {
        AIInsightDTO dto = new AIInsightDTO();
        dto.setWeek(insight.getWeek());
        dto.setContent(insight.getContent());
        dto.setGeneratedAt(insight.getGeneratedAt().toString());
        return dto;
    }
}