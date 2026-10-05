package com.example.demo.service;

import com.example.demo.entity.Skill;
import com.example.demo.entity.User;
import com.example.demo.repository.SkillRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SkillGapService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public SkillGapService(
            UserRepository userRepository,
            SkillRepository skillRepository) {

        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    public Map<String, Object> analyzeSkillGap(
            Long userId,
            String currentSkills) {

        // 1. Find user
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // 2. Get required skills based on sector
        List<Skill> requiredSkills =
                skillRepository.findBySector(
                        user.getSector().name());

        // 3. Convert user's skills into a list
        List<String> userSkills = Arrays.stream(
                        currentSkills.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(skill -> !skill.isEmpty())
                .toList();

        // 4. Lists for result
        List<String> matchedSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        // 5. Compare skills
        for (Skill skill : requiredSkills) {

            String requiredSkill =
                    skill.getSkillName().trim();

            if (userSkills.contains(
                    requiredSkill.toLowerCase())) {

                matchedSkills.add(requiredSkill);

            } else {

                missingSkills.add(requiredSkill);
            }
        }

        // 6. Calculate match percentage
        double matchPercentage = 0;

        if (!requiredSkills.isEmpty()) {

            matchPercentage =
                    ((double) matchedSkills.size()
                    / requiredSkills.size()) * 100;
        }

        // 7. Prepare response
        Map<String, Object> result =
                new HashMap<>();

        result.put("userId", userId);
        result.put("education", user.getEducation());
        result.put("sector", user.getSector().name());
        result.put("matchedSkills", matchedSkills);
        result.put("missingSkills", missingSkills);
        result.put("matchPercentage",
                Math.round(matchPercentage * 100.0) / 100.0);

        return result;
    }

}