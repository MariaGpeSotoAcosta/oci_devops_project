package com.springboot.MyTodoList.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class KPIAnalysisService {
    
    @Autowired
    private AnalyticsService analyticsService;
    
    public VelocityData getVelocityTrends() {
        // Use your existing analytics
        // Calculate completion rate from tasks
        return new VelocityData();
    }
    
    public PriorityData getPriorityDistribution() {
        // Use existing analytics
        return new PriorityData();
    }
    
    public WorkloadData getWorkloadDistribution() {
        // Use existing analytics
        return new WorkloadData();
    }
    
    // Inner classes for data structures
    public static class VelocityData {
        private double completionRate;
        // getters/setters
    }
    
    public static class PriorityData {
        private double highPriorityPercentage;
        // getters/setters
    }
    
    public static class WorkloadData {
        private double imbalanceScore;
        private String mostLoadedMember;
        private String leastLoadedMember;
        // getters/setters
    }
}