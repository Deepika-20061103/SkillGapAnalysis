package com.example.demo.job.controller;

import com.example.demo.job.entity.LinkedInProfile;
import com.example.demo.job.service.LinkedInProfileService;
import com.example.demo.job.service.LinkedInOAuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/linkedin")
public class LinkedInProfileController {

    private final LinkedInProfileService linkedInProfileService;
    private final LinkedInOAuthService linkedInOAuthService;

    public LinkedInProfileController(
            LinkedInProfileService linkedInProfileService,
            LinkedInOAuthService linkedInOAuthService) {

        this.linkedInProfileService = linkedInProfileService;
        this.linkedInOAuthService = linkedInOAuthService;
    }

    @PostMapping("/profile/{userId}")
    public ResponseEntity<LinkedInProfile> saveProfile(
            @PathVariable Long userId,
            @RequestBody LinkedInProfile profile) {

        return ResponseEntity.ok(
                linkedInProfileService.saveProfile(
                        userId,
                        profile
                )
        );
    }

    @GetMapping("/profile/user/{userId}")
    public ResponseEntity<LinkedInProfile> getProfileByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                linkedInProfileService
                        .getProfileByUserId(userId)
        );
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<LinkedInProfile> getProfileById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                linkedInProfileService
                        .getProfileById(id)
        );
    }

    // LinkedIn Login
    @GetMapping("/login")
    public void login(
            @RequestParam Long userId,
            jakarta.servlet.http.HttpServletResponse response)
            throws java.io.IOException {

        String authorizationUrl =
                linkedInOAuthService.getAuthorizationUrl(userId);

        response.sendRedirect(authorizationUrl);
    }

    @GetMapping("/callback")
    public void callback(
            @RequestParam String code,
            @RequestParam String state,
            jakarta.servlet.http.HttpServletResponse response)
            throws java.io.IOException {

        Long userId = Long.parseLong(state);

        linkedInOAuthService.exchangeCodeForAccessToken(
                code,
                userId
        );

        response.sendRedirect(
                "http://localhost:5173/?linkedin=connected"
        );
    }
    @PutMapping("/skills/{userId}")
    public ResponseEntity<LinkedInProfile> updateSkills(
            @PathVariable Long userId,
            @RequestParam String skills) {

        LinkedInProfile profile =
                linkedInProfileService.getProfileByUserId(userId);

        profile.setSkills(skills);

        return ResponseEntity.ok(
                linkedInProfileService.saveProfile(userId, profile)
        );
    }
}