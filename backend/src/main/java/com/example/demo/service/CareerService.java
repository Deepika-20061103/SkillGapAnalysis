package com.example.demo.service;

import com.example.demo.entity.Career;
import com.example.demo.repository.CareerRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CareerService {

    private final CareerRepository careerRepository;

    public CareerService(CareerRepository careerRepository) {
        this.careerRepository = careerRepository;
    }

    public Career addCareer(Career career) {
        return careerRepository.save(career);
    }

    public List<Career> getAllCareers() {
        return careerRepository.findAll();
    }

    public List<Career> getCareersBySector(String sector) {
        return careerRepository.findBySector(sector);
    }
}