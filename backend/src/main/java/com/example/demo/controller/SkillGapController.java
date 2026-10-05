package com.example.demo.controller;

import com.example.demo.service.SkillGapService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/skill-gap")
public class SkillGapController {

    private final SkillGapService skillGapService;

    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> analyzeSkillGap(
            @PathVariable Long userId,
            @RequestParam String currentSkills) {

        Map<String, Object> result =
                skillGapService.analyzeSkillGap(
                        userId,
                        currentSkills
                );

        return ResponseEntity.ok(result);
    }
}