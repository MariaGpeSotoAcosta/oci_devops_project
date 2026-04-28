package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.AIInsightDTO;
import com.springboot.MyTodoList.service.AIInsightsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/insights")
@CrossOrigin(origins = "*") // Configure as needed for your frontend
public class AIInsightsController {

    @Autowired
    private AIInsightsService aiInsightsService;

    /**
     * Get all AI insights
     */
    @GetMapping
    public ResponseEntity<List<AIInsightDTO>> getAllInsights() {
        List<AIInsightDTO> insights = aiInsightsService.getAllInsights();
        return ResponseEntity.ok(insights);
    }

    /**
     * Generate new AI insights based on current KPI data
     */
    @PostMapping("/generate")
    public ResponseEntity<AIInsightDTO> generateInsights() {
        AIInsightDTO insight = aiInsightsService.generateNewInsight();
        return ResponseEntity.ok(insight);
    }

    /**
     * Get insights for a specific week
     */
    @GetMapping("/week/{week}")
    public ResponseEntity<AIInsightDTO> getInsightByWeek(@PathVariable String week) {
        AIInsightDTO insight = aiInsightsService.getInsightByWeek(week);
        if (insight == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(insight);
    }
}