package com.example.demo.job.service;

import com.example.demo.entity.User;
import com.example.demo.job.entity.LinkedInProfile;
import com.example.demo.job.repository.LinkedInProfileRepository;
import com.example.demo.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LinkedInProfileService {

    private final LinkedInProfileRepository linkedInProfileRepository;
    private final UserRepository userRepository;

    public LinkedInProfileService(
            LinkedInProfileRepository linkedInProfileRepository,
            UserRepository userRepository) {

        this.linkedInProfileRepository = linkedInProfileRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public LinkedInProfile saveProfile(
            Long userId,
            LinkedInProfile profile) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        /*
         * Check whether this user already has a LinkedIn profile.
         * If yes, UPDATE it instead of INSERTING a new row.
         */
        LinkedInProfile existingProfile =
                linkedInProfileRepository
                        .findByUserId(userId)
                        .orElse(null);

        if (existingProfile != null) {

            existingProfile.setLinkedinId(
                    profile.getLinkedinId());

            existingProfile.setName(
                    profile.getName());

            existingProfile.setEmail(
                    profile.getEmail());

            existingProfile.setPicture(
                    profile.getPicture());

            existingProfile.setProfileUrl(
                    profile.getProfileUrl());

            existingProfile.setHeadline(
                    profile.getHeadline());

            existingProfile.setSummary(
                    profile.getSummary());

            /*
             * Don't erase existing skills when LinkedIn
             * doesn't provide skills.
             */
            if (profile.getSkills() != null &&
                    !profile.getSkills().trim().isEmpty()) {

                existingProfile.setSkills(
                        profile.getSkills());
            }

            return linkedInProfileRepository.save(
                    existingProfile);
        }

        /*
         * No existing profile → create a new one.
         */
        profile.setUser(user);

        return linkedInProfileRepository.save(profile);
    }

    public LinkedInProfile getProfileByUserId(Long userId) {

        return linkedInProfileRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "LinkedIn profile not found"));
    }

    public LinkedInProfile getProfileById(Long id) {

        return linkedInProfileRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "LinkedIn profile not found"));
    }
}