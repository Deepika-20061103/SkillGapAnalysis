package com.example.demo.job.controller;


import com.example.demo.entity.PracticeResource;
import com.example.demo.job.service.practiceResourceService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/practice-resources")
@CrossOrigin(origins = "http://localhost:5173")
public class PracticeResourceController {

    private final practiceResourceService practiceResourceService;

    public PracticeResourceController(practiceResourceService practiceResourceService) {
        this.practiceResourceService = practiceResourceService;
    }

    @GetMapping
    public List<PracticeResource> getPracticeResources() {
        return practiceResourceService.getAllResources();
    }
}
