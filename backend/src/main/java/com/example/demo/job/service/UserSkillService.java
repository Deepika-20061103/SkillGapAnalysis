package com.example.demo.job.service;

import com.example.demo.entity.Skill;
import com.example.demo.entity.User;
import com.example.demo.entity.UserSkill;
import com.example.demo.repository.UserSkillRepository;
import com.example.demo.repository.SkillRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserSkillService {

    private final UserSkillRepository userSkillRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public UserSkillService(
            UserSkillRepository userSkillRepository,
            UserRepository userRepository,
            SkillRepository skillRepository) {

        this.userSkillRepository = userSkillRepository;
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    @Transactional
    public void saveUserSkills(Long userId, List<String> skillNames) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Remove the user's old skills first
        userSkillRepository.deleteByUserId(userId);

        // Force DELETE to execute before INSERT
        userSkillRepository.flush();

        if (skillNames == null || skillNames.isEmpty()) {
            return;
        }

        // Remove duplicate skills from the request
        java.util.Set<String> uniqueSkills =
                new java.util.LinkedHashSet<>();

        for (String skillName : skillNames) {

            if (skillName == null ||
                    skillName.trim().isEmpty()) {
                continue;
            }

            uniqueSkills.add(
                    skillName.trim().toLowerCase()
            );
        }

        for (String cleanedName : uniqueSkills) {

            Skill skill = skillRepository
                    .findTopBySkillNameIgnoreCaseOrderByIdAsc(cleanedName)
                    .orElseGet(() -> {

                        Skill newSkill = new Skill(
                                cleanedName,
                                "Other",
                                user.getSector() != null
                                        ? user.getSector().name()
                                        : "PRIVATE"
                        );

                        return skillRepository.save(newSkill);
                    });

            userSkillRepository.save(
                    new UserSkill(user, skill)
            );
        }
    }
    // 👇 KEEP THIS METHOD TOO
    public List<String> getUserSkillNames(Long userId) {

        return userSkillRepository.findByUserId(userId)
                .stream()
                .map(us -> us.getSkill().getSkillName())
                .toList();
    }
    
}