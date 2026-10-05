package com.example.demo.job.controller;

import com.example.demo.job.service.UserSkillService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserSkillController {

    private final UserSkillService userSkillService;

    public UserSkillController(UserSkillService userSkillService) {
        this.userSkillService = userSkillService;
    }

    @PutMapping("/{userId}/skills")
    public ResponseEntity<List<String>> saveUserSkills(
            @PathVariable Long userId,
            @RequestBody List<String> skills) {

        userSkillService.saveUserSkills(userId, skills);

        return ResponseEntity.ok(
                userSkillService.getUserSkillNames(userId)
        );
    }

    @GetMapping("/{userId}/skills")
    public ResponseEntity<List<String>> getUserSkills(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                userSkillService.getUserSkillNames(userId)
        );
    }
    
}