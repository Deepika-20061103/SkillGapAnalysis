package com.example.demo.job.controller;

import com.example.demo.job.entity.JobPosting;
import com.example.demo.job.service.JobPostingService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobPostingController {

    private final JobPostingService jobPostingService;

    public JobPostingController(JobPostingService jobPostingService) {
        this.jobPostingService = jobPostingService;
    }

    @PostMapping
    public ResponseEntity<JobPosting> createJobPosting(
            @RequestBody JobPosting jobPosting) {

        return ResponseEntity.ok(
                jobPostingService.createJobPosting(jobPosting)
        );
    }

    @GetMapping
    public ResponseEntity<List<JobPosting>> getAllJobPostings() {

        return ResponseEntity.ok(
                jobPostingService.getAllJobPostings()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPosting> getJobPostingById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                jobPostingService.getJobPostingById(id)
        );
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobPosting>> getJobsByCompany(
            @PathVariable Long companyId) {

        return ResponseEntity.ok(
                jobPostingService.getJobsByCompany(companyId)
        );
    }
}