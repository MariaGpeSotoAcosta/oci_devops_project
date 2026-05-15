package com.springboot.MyTodoList.service;

import com.springboot.MyTodoList.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class KPIAnalysisService {

    @Autowired
    private AnalyticsService analyticsService;

    public String getVelocityTrends(Long userId) {
        List<VelocityDTO> data = analyticsService.getVelocity(userId, 4, null, null);
        if (data.isEmpty()) return "No velocity data available";
        StringBuilder sb = new StringBuilder();
        for (VelocityDTO v : data) {
            sb.append(String.format("Week %s: %d created, %d completed. ",
                v.getWeek(), v.getCreated(), v.getCompleted()));
        }
        return sb.toString();
    }

    public String getPriorityDistribution(Long userId) {
        List<PriorityDistributionDTO> data = analyticsService.getPriorityDistribution(userId, null, null);
        if (data.isEmpty()) return "No priority data available";
        StringBuilder sb = new StringBuilder();
        for (PriorityDistributionDTO p : data) {
            sb.append(String.format("%s: %d tasks. ", p.getPriority(), p.getCount()));
        }
        return sb.toString();
    }

    public String getWorkloadDistribution(Long userId) {
        List<TaskDistributionDTO> data = analyticsService.getTaskDistribution(userId, null, null);
        if (data.isEmpty()) return "No workload data available";
        StringBuilder sb = new StringBuilder();
        for (TaskDistributionDTO d : data) {
            sb.append(String.format("%s: %d tasks (%.1f%%). ",
                d.getUserName(), d.getTaskCount(), d.getPercentage()));
        }
        return sb.toString();
    }

    public String getWorkedHours(Long userId) {
        List<WorkedHoursDTO> data = analyticsService.getWorkedHoursPerUser(userId, 4, null, null);
        if (data.isEmpty()) return "No worked hours data available";
        StringBuilder sb = new StringBuilder();
        for (WorkedHoursDTO w : data) {
            sb.append(String.format("%s - %s: %d hours. ",
                w.getWeek(), w.getUserName(), w.getHours()));
        }
        return sb.toString();
    }
}