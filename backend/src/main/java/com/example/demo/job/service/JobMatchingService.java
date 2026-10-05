package com.example.demo.job.service;

import com.example.demo.entity.User;
import com.example.demo.job.entity.JobPosting;
import com.example.demo.job.repository.JobPostingRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.job.entity.LinkedInProfile;
import com.example.demo.job.repository.LinkedInProfileRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JobMatchingService {

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;
    private final LinkedInProfileRepository linkedInProfileRepository;
    public JobMatchingService(
            JobPostingRepository jobPostingRepository,
            UserRepository userRepository,
            LinkedInProfileRepository linkedInProfileRepository) {

        this.jobPostingRepository = jobPostingRepository;
        this.userRepository = userRepository;
        this.linkedInProfileRepository = linkedInProfileRepository;
    }

    public List<Map<String, Object>> matchJobs(
            Long userId,
            String currentSkills) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Set<String> userSkills = new HashSet<>(
                Arrays.stream(currentSkills.split(","))
                        .map(String::trim)
                        .map(String::toLowerCase)
                        .filter(skill -> !skill.isEmpty())
                        .toList()
        );

        List<JobPosting> jobs =
                jobPostingRepository.findAll();

        List<Map<String, Object>> results =
                new ArrayList<>();

        for (JobPosting job : jobs) {

            List<String> requiredSkills =
                    Arrays.stream(
                            job.getRequiredSkills().split(","))
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

            result.put("jobId", job.getId());
            result.put("company",
                    job.getCompany().getCompanyName());
            result.put("jobTitle", job.getTitle());
            result.put("location", job.getLocation());
            result.put("employmentType",
                    job.getEmploymentType());
            result.put("matchedSkills", matchedSkills);
            result.put("missingSkills", missingSkills);
            result.put(
                    "matchPercentage",
                    Math.round(matchPercentage * 100.0) / 100.0
            );

            results.add(result);
        }

        results.sort((a, b) ->
                Double.compare(
                        ((Number) b.get("matchPercentage"))
                                .doubleValue(),
                        ((Number) a.get("matchPercentage"))
                                .doubleValue()
                )
        );

        return results;
    }public List<Map<String, Object>> matchLinkedInJobs(Long userId) {

        LinkedInProfile profile =
                linkedInProfileRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "LinkedIn profile not found"));

        if (profile.getSkills() == null ||
                profile.getSkills().trim().isEmpty()) {

            throw new RuntimeException(
                    "No LinkedIn skills found for this user");
        }

        return matchJobs(
                userId,
                profile.getSkills()
        );
    }
}