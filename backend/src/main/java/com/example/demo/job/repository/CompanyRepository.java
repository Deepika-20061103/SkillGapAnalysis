package com.example.demo.job.repository;

import com.example.demo.job.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository
        extends JpaRepository<Company, Long> {
}