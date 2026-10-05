package com.example.demo.service;

import com.example.demo.entity.Career;
import com.example.demo.entity.User;
import com.example.demo.repository.CareerRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CareerRecommendationService {

    private final CareerRepository careerRepository;
    private final UserRepository userRepository;

    public CareerRecommendationService(
            CareerRepository careerRepository,
            UserRepository userRepository) {

        this.careerRepository = careerRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> recommendCareers(
            Long userId,
            String currentSkills) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Career> careers =
                careerRepository.findBySector(
                        user.getSector().name());

        Set<String> userSkills =
                new HashSet<>(
                        Arrays.stream(currentSkills.split(","))
                                .map(String::trim)
                                .map(String::toLowerCase)
                                .filter(skill -> !skill.isEmpty())
                                .toList()
                );

        List<Map<String, Object>> recommendations =
                new ArrayList<>();

        for (Career career : careers) {

            List<String> requiredSkills =
                    Arrays.stream(
                            career.getRequiredSkills().split(","))
                            .map(String::trim)
                            .filter(skill -> !skill.isEmpty())
                            .toList();

            List<String> matchedSkills =
                    new ArrayList<>();

            List<String> missingSkills =
                    new ArrayList<>();

            for (String skill : requiredSkills) {

                if (userSkills.contains(
                        skill.toLowerCase())) {

                    matchedSkills.add(skill);

                } else {

                    missingSkills.add(skill);
                }
            }

            double matchPercentage = 0;

            if (!requiredSkills.isEmpty()) {

                matchPercentage =
                        ((double) matchedSkills.size()
                        / requiredSkills.size()) * 100;
            }

            Map<String, Object> result =
                    new LinkedHashMap<>();

            result.put("careerId", career.getId());
            result.put("careerName", career.getCareerName());
            result.put("description", career.getDescription());
            result.put("matchedSkills", matchedSkills);
            result.put("missingSkills", missingSkills);
            result.put(
                    "matchPercentage",
                    Math.round(matchPercentage * 100.0) / 100.0
            );

            recommendations.add(result);
        }

        recommendations.sort((a, b) ->
                Double.compare(
                        (Double) b.get("matchPercentage"),
                        (Double) a.get("matchPercentage")
                )
        );

        return recommendations;
    }
}