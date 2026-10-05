package com.example.demo.job.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "job_postings")
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private String title;

    @Column(length = 2000)
    private String jobDescription;

    @Column(length = 1000)
    private String requiredSkills;

    private String location;

    private String employmentType;

    public JobPosting() {
    }

    public JobPosting(
            Company company,
            String title,
            String jobDescription,
            String requiredSkills,
            String location,
            String employmentType) {

        this.company = company;
        this.title = title;
        this.jobDescription = jobDescription;
        this.requiredSkills = requiredSkills;
        this.location = location;
        this.employmentType = employmentType;
    }

    public Long getId() {
        return id;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }
}