package com.example.demo.job.controller;

import com.example.demo.job.service.JobMatchingService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-matching")
public class JobMatchingController {

    private final JobMatchingService jobMatchingService;

    public JobMatchingController(
            JobMatchingService jobMatchingService) {

        this.jobMatchingService = jobMatchingService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Map<String, Object>>> matchJobs(
            @PathVariable Long userId,
            @RequestParam String currentSkills) {

        return ResponseEntity.ok(
                jobMatchingService.matchJobs(
                        userId,
                        currentSkills
                )
        );
    }
    @GetMapping("/linkedin/{userId}")
    public ResponseEntity<List<Map<String, Object>>> matchLinkedInJobs(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                jobMatchingService.matchLinkedInJobs(userId)
        );
    }
}