package com.example.demo.controller;

import com.example.demo.entity.Career;
import com.example.demo.service.CareerService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.example.demo.service.CareerRecommendationService;
@RestController
@RequestMapping("/api/careers")
public class CareerController {

	private final CareerService careerService;
	private final CareerRecommendationService careerRecommendationService;

	public CareerController(
	        CareerService careerService,
	        CareerRecommendationService careerRecommendationService) {

	    this.careerService = careerService;
	    this.careerRecommendationService =
	            careerRecommendationService;
	}

    @PostMapping
    public Career addCareer(@RequestBody Career career) {
        return careerService.addCareer(career);
    }

    @GetMapping
    public List<Career> getAllCareers() {
        return careerService.getAllCareers();
    }

    @GetMapping("/sector/{sector}")
    public List<Career> getCareersBySector(
            @PathVariable String sector) {

        return careerService.getCareersBySector(sector);
    }
    @GetMapping("/recommend/{userId}")
    public ResponseEntity<List<Map<String, Object>>> recommendCareers(
            @PathVariable Long userId,
            @RequestParam String currentSkills) {

        return ResponseEntity.ok(
                careerRecommendationService.recommendCareers(
                        userId,
                        currentSkills
                )
        );
    }
}