package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "careers")
public class Career {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String careerName;

    private String sector;

    private String requiredSkills;

    private String description;

    public Career() {
    }

    public Career(String careerName, String sector,
                  String requiredSkills, String description) {
        this.careerName = careerName;
        this.sector = sector;
        this.requiredSkills = requiredSkills;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public String getCareerName() {
        return careerName;
    }

    public void setCareerName(String careerName) {
        this.careerName = careerName;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}