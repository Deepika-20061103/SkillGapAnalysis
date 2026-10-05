package com.example.demo.repository;

import com.example.demo.entity.Career;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CareerRepository
        extends JpaRepository<Career, Long> {

    List<Career> findBySector(String sector);
}