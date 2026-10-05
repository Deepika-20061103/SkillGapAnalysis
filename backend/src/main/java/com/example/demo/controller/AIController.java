package com.example.demo.controller;

import com.example.demo.dto.FutureSkillRequest;
import com.example.demo.service.AIService;
import com.example.demo.service.CareerRecommendationService;
import com.example.demo.service.SkillGapService;
import com.example.demo.job.service.JobMatchingService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final SkillGapService skillGapService;
    private final CareerRecommendationService careerRecommendationService;
    private final JobMatchingService jobMatchingService;
    private final AIService aiService;

    public AIController(
            AIService aiService,
            SkillGapService skillGapService,
            CareerRecommendationService careerRecommendationService,
            JobMatchingService jobMatchingService) {

        this.aiService = aiService;
        this.skillGapService = skillGapService;
        this.careerRecommendationService =
                careerRecommendationService;
        this.jobMatchingService = jobMatchingService;
    }


    // =====================================================
    // FUTURE SKILLS
    // =====================================================

    @PostMapping("/future-skills")
    public ResponseEntity<String> futureSkills(
            @RequestBody FutureSkillRequest request) {

        String response = aiService.generateFutureSkills(
                request.getEducation(),
                request.getSector(),
                request.getCurrentSkills()
        );

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // AI SKILL GAP ANALYSIS
    // =====================================================

    @PostMapping("/analyze-skill-gap")
    public ResponseEntity<String> analyzeSkillGap(
            @RequestBody Map<String, String> request) {

        String education = request.get("education");
        String sector = request.get("sector");
        String currentSkills = request.get("currentSkills");

        if (education == null || education.isBlank()) {
            education = "Not specified";
        }

        if (sector == null || sector.isBlank()) {
            sector = "PRIVATE";
        }

        if (currentSkills == null || currentSkills.isBlank()) {
            currentSkills = "No skills provided";
        }

        String response = aiService.analyzeSkillGap(
                education,
                sector,
                currentSkills
        );

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // CAREER ANALYSIS
    // =====================================================

    @PostMapping("/career-analysis/{userId}")
    public ResponseEntity<String> careerAnalysis(
            @PathVariable Long userId,
            @RequestParam String currentSkills) {

        Map<String, Object> skillGap =
                skillGapService.analyzeSkillGap(
                        userId,
                        currentSkills
                );

        String education =
                skillGap.get("education") != null
                        ? skillGap.get("education").toString()
                        : "Not specified";

        String sector =
                skillGap.get("sector") != null
                        ? skillGap.get("sector").toString()
                        : "PRIVATE";

        String response = aiService.analyzeSkillGap(
                education,
                sector,
                currentSkills
        );

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // AI CAREER RECOMMENDATION
    // =====================================================

    @PostMapping("/career-recommendation/{userId}")
    public ResponseEntity<String> careerRecommendation(
            @PathVariable Long userId,
            @RequestParam String currentSkills) {

        Map<String, Object> skillGap =
                skillGapService.analyzeSkillGap(
                        userId,
                        currentSkills
                );

        String careerMatches =
                careerRecommendationService
                        .recommendCareers(
                                userId,
                                currentSkills
                        )
                        .toString();

        String education =
                skillGap.get("education") != null
                        ? skillGap.get("education").toString()
                        : "Not specified";

        String sector =
                skillGap.get("sector") != null
                        ? skillGap.get("sector").toString()
                        : "PRIVATE";

        String response =
                aiService.analyzeCareerRecommendations(
                        education,
                        sector,
                        currentSkills,
                        careerMatches
                );

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // AI JOB RECOMMENDATION
    // =====================================================

    @PostMapping("/job-recommendation/{userId}")
    public ResponseEntity<String> jobRecommendation(
            @PathVariable Long userId,
            @RequestParam String currentSkills) {

        Map<String, Object> skillGap =
                skillGapService.analyzeSkillGap(
                        userId,
                        currentSkills
                );

        String jobMatches =
                jobMatchingService
                        .matchJobs(
                                userId,
                                currentSkills
                        )
                        .toString();

        String education =
                skillGap.get("education") != null
                        ? skillGap.get("education").toString()
                        : "Not specified";

        String response =
                aiService.analyzeJobMatches(
                        education,
                        currentSkills,
                        jobMatches
                );

        return ResponseEntity.ok(response);
    }
}