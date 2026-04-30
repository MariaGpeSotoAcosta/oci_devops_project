package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.dto.AIInsightDTO;
import com.springboot.MyTodoList.model.AIInsight;
import com.springboot.MyTodoList.repository.AIInsightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class AIInsightsService {

    @Autowired
    private AIInsightRepository aiInsightRepository;

    @Autowired
    private KPIAnalysisService kpiAnalysisService;

    @Autowired
    private OpenAIService openAIService;

    public List<AIInsightDTO> getAllInsights() {
        return aiInsightRepository.findAllByOrderByWeekDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AIInsightDTO getInsightByWeek(String week) {
        return aiInsightRepository.findByWeek(week)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public AIInsightDTO generateNewInsight(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        int weekNumber = now.get(weekFields.weekOfWeekBasedYear());
        int year = now.get(weekFields.weekBasedYear());
        String weekString = String.format("%d-W%02d", year, weekNumber);

        String markdownContent = generateInsightContent(userId);

        AIInsight insight = new AIInsight();
        insight.setWeek(weekString);
        insight.setContent(markdownContent);
        insight.setGeneratedAt(now);

        AIInsight saved = aiInsightRepository.save(insight);
        return convertToDTO(saved);
    }

    private String generateInsightContent(Long userId) {
        String velocityData = kpiAnalysisService.getVelocityTrends(userId);
        String priorityData = kpiAnalysisService.getPriorityDistribution(userId);
        String workloadData = kpiAnalysisService.getWorkloadDistribution(userId);
        String workedHours = kpiAnalysisService.getWorkedHours(userId);

        String prompt = String.format("""
            You are a project manager assistant. Analyze the following REAL team KPI data and generate
            a detailed weekly performance report in Markdown format.

            REAL DATA FROM THE TEAM:
            - Task Velocity (last 4 weeks): %s
            - Priority Distribution: %s
            - Workload per member: %s
            - Worked Hours (last 4 weeks): %s

            Generate a report with:
            # Weekly Team Performance Report

            ## 🚀 Velocity
            - Status (✅ Good / ⚠️ Needs Attention)
            - Analysis based on the real data
            - 2-3 specific recommendations

            ## ⚖️ Priority Balance
            - Status
            - Analysis based on real priority counts
            - 2-3 recommendations

            ## 👥 Workload Distribution
            - Status
            - Name the most and least loaded members using the real data
            - 2-3 recommendations

            ## ⏱️ Worked Hours
            - Status
            - Analysis of hours worked per person
            - 2-3 recommendations

            ## 📊 Key KPIs Summary
            - Completion rate
            - Most overloaded member
            - Priority balance score

            Use the actual numbers from the data in your analysis.
            """,
            velocityData, priorityData, workloadData, workedHours
        );

        return openAIService.generateText(prompt);
    }

    private AIInsightDTO convertToDTO(AIInsight insight) {
        AIInsightDTO dto = new AIInsightDTO();
        dto.setWeek(insight.getWeek());
        dto.setContent(insight.getContent());
        dto.setGeneratedAt(insight.getGeneratedAt().toString());
        return dto;
    }
}