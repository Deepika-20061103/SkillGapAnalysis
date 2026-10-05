package com.example.demo.job.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;

    private String industry;

    private String location;

    private String website;

    public Company() {
    }

    public Company(
            String companyName,
            String industry,
            String location,
            String website) {

        this.companyName = companyName;
        this.industry = industry;
        this.location = location;
        this.website = website;
    }

    public Long getId() {
        return id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

	public void setId(Long id) {
		this.id = id;
	}

	public Company(Long id, String companyName, String industry, String location, String website) {
		super();
		this.id = id;
		this.companyName = companyName;
		this.industry = industry;
		this.location = location;
		this.website = website;
	}
    
}