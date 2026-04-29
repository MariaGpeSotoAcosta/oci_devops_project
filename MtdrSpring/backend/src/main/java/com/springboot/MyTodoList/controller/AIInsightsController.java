package com.springboot.MyTodoList.controller;

import com.springboot.MyTodoList.dto.AIInsightDTO;
import com.springboot.MyTodoList.service.AIInsightsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/insights")
@CrossOrigin(origins = "*")
public class AIInsightsController {

    @Autowired
    private AIInsightsService aiInsightsService;

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Controller works!");
    }

    @GetMapping("/generate-test")
    public ResponseEntity<String> generateTest() {
        try {
            AIInsightDTO insight = aiInsightsService.generateNewInsight(1L);
            return ResponseEntity.ok("SUCCESS: " + insight.getWeek());
        } catch (Exception e) {
            return ResponseEntity.ok("ERROR: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<AIInsightDTO>> getAllInsights() {
        List<AIInsightDTO> insights = aiInsightsService.getAllInsights();
        return ResponseEntity.ok(insights);
    }

    @PostMapping("/generate")
    public ResponseEntity<AIInsightDTO> generateInsights(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        AIInsightDTO insight = aiInsightsService.generateNewInsight(userId);
        return ResponseEntity.ok(insight);
    }

    @GetMapping("/week/{week}")
    public ResponseEntity<AIInsightDTO> getInsightByWeek(@PathVariable String week) {
        AIInsightDTO insight = aiInsightsService.getInsightByWeek(week);
        if (insight == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(insight);
    }
}