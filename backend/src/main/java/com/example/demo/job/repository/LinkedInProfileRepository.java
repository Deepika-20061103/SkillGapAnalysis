package com.example.demo.job.repository;

import com.example.demo.job.entity.LinkedInProfile;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LinkedInProfileRepository
        extends JpaRepository<LinkedInProfile, Long> {

    Optional<LinkedInProfile> findByUserId(Long userId);
}