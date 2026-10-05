package com.example.demo.controller;

import com.example.demo.entity.Skill;
import com.example.demo.service.SkillService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @PostMapping
    public Skill addSkill(@RequestBody Skill skill) {
        return skillService.addSkill(skill);
    }

    @GetMapping
    public List<Skill> getAllSkills() {
        return skillService.getAllSkills();
    }

    @GetMapping("/sector/{sector}")
    public List<Skill> getSkillsBySector(
            @PathVariable String sector) {

        return skillService.getSkillsBySector(sector);
    }
}