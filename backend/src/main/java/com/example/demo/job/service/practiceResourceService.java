package com.example.demo.job.service;

import com.example.demo.entity.PracticeResource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class practiceResourceService {

    public List<PracticeResource> getAllResources() {
        List<PracticeResource> resources = new ArrayList<>();

        add(resources, "python", "HackerRank Python", "https://www.hackerrank.com/domains/python", "Practice");
        add(resources, "python", "Kaggle Learn", "https://www.kaggle.com/learn", "Course");
        add(resources, "python", "freeCodeCamp", "https://www.freecodecamp.org/learn/", "Course");

        add(resources, "programming", "HackerRank Practice", "https://www.hackerrank.com/domains", "Practice");
        add(resources, "programming", "LeetCode", "https://leetcode.com/problemset/", "Practice");
        add(resources, "programming", "Codewars", "https://www.codewars.com/", "Practice");

        add(resources, "sql", "HackerRank SQL", "https://www.hackerrank.com/domains/sql", "Practice");
        add(resources, "sql", "SQLBolt", "https://sqlbolt.com/", "Course");
        add(resources, "sql", "W3Schools SQL", "https://www.w3schools.com/sql/", "Tutorial");

        add(resources, "web", "freeCodeCamp", "https://www.freecodecamp.org/learn/", "Course");
        add(resources, "web", "MDN Web Docs", "https://developer.mozilla.org/en-US/docs/Learn", "Tutorial");
        add(resources, "web", "Frontend Mentor", "https://www.frontendmentor.io/", "Projects");

        add(resources, "cloud", "Microsoft Learn", "https://learn.microsoft.com/training/", "Course");
        add(resources, "cloud", "AWS Skill Builder", "https://skillbuilder.aws/", "Course");
        add(resources, "cloud", "KodeKloud", "https://kodekloud.com/", "Course");

        add(resources, "machine learning", "Kaggle Learn", "https://www.kaggle.com/learn", "Course");
        add(resources, "machine learning", "Google Machine Learning", "https://developers.google.com/machine-learning", "Tutorial");
        add(resources, "machine learning", "DataCamp", "https://www.datacamp.com/", "Course");

        add(resources, "security", "TryHackMe", "https://tryhackme.com/", "Practice");
        add(resources, "security", "Cisco Skills for All", "https://skillsforall.com/", "Course");
        add(resources, "security", "HackerRank Practice", "https://www.hackerrank.com/domains", "Practice");

        add(resources, "git", "GitHub Skills", "https://skills.github.com/", "Practice");
        add(resources, "git", "Learn Git Branching", "https://learngitbranching.js.org/", "Practice");
        add(resources, "git", "Atlassian Git Tutorials", "https://www.atlassian.com/git/tutorials", "Tutorial");

        return resources;
    }

    private void add(List<PracticeResource> resources, String skill, String name, String url, String type) {
        resources.add(new PracticeResource(skill, name, url, type));
    }
}
