package com.example.demo.controller;

import com.example.demo.repository.ResumeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file) {

        try {
            return ResponseEntity.ok(
                    resumeService.processResume(file)
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            java.util.Map.of(
                                    "error", e.getMessage()
                            )
                    );
        }
    }
}