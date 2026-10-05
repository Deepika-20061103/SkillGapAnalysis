package com.example.demo.job.service;

import com.example.demo.job.entity.Company;
import com.example.demo.job.entity.JobPosting;
import com.example.demo.job.repository.CompanyRepository;
import com.example.demo.job.repository.JobPostingRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final CompanyRepository companyRepository;

    public JobPostingService(
            JobPostingRepository jobPostingRepository,
            CompanyRepository companyRepository) {

        this.jobPostingRepository = jobPostingRepository;
        this.companyRepository = companyRepository;
    }

    public JobPosting createJobPosting(JobPosting jobPosting) {

        if (jobPosting.getCompany() == null
                || jobPosting.getCompany().getId() == null) {

            throw new RuntimeException("Company ID is required");
        }

        Company company = companyRepository
                .findById(jobPosting.getCompany().getId())
                .orElseThrow(() ->
                        new RuntimeException("Company not found"));

        jobPosting.setCompany(company);

        return jobPostingRepository.save(jobPosting);
    }

    public List<JobPosting> getAllJobPostings() {
        return jobPostingRepository.findAll();
    }

    public JobPosting getJobPostingById(Long id) {
        return jobPostingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Job posting not found"));
    }

    public List<JobPosting> getJobsByCompany(Long companyId) {

        return jobPostingRepository
                .findByCompanyId(companyId);
    }
}