package com.example.demo.entity;

public class PracticeResource {
    private String skill;
    private String name;
    private String url;
    private String type;

    public PracticeResource() {
    }

    public PracticeResource(String skill, String name, String url, String type) {
        this.skill = skill;
        this.name = name;
        this.url = url;
        this.type = type;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
