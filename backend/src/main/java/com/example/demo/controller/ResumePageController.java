
package com.example.demo.controller;

import java.util.Map;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.repository.ResumeService;

@Controller
@RequestMapping("/resume")
public class ResumePageController {

    private final ResumeService resumeService;

    public ResumePageController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // Open the resume upload page
    @GetMapping
    public String showResumePage() {
        return "resume";
    }

    // Process uploaded resume
    @PostMapping("/upload")
    public String uploadResume(
            @RequestParam("file") MultipartFile file,
            Model model) {

        try {

            Map<String, Object> result =
                    resumeService.processResume(file);

            model.addAttribute("fileName", result.get("fileName"));
            model.addAttribute("extractedText", result.get("extractedText"));
            model.addAttribute("aiAnalysis", result.get("aiAnalysis"));

            return "resume-result";

        } catch (Exception e) {

            model.addAttribute("error", e.getMessage());

            return "resume";
        }
    }
}