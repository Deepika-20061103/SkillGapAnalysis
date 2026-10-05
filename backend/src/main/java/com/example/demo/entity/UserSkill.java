package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "user_skills",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "skill_id"}
    )
)
public class UserSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    public UserSkill() {
    }

    public UserSkill(User user, Skill skill) {
        this.user = user;
        this.skill = skill;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Skill getSkill() {
        return skill;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }
}