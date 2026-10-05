
package com.example.demo.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class AIService {

    private final RestClient restClient;

    public AIService() {
        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:11434")
                .build();
    }

    // =====================================================
    // FUTURE SKILLS
    // =====================================================

    public String generateFutureSkills(
            String education,
            String sector,
            String currentSkills) {

        String prompt = """
                You are SkillMapAI, an AI-powered future skills
                and career advisor.

                Analyze this student's profile:

                Education: %s
                Sector: %s
                Current Skills: %s

                Based on the student's current skills, education,
                sector and future technology trends, recommend
                skills the student should learn in the future.

                IMPORTANT:
                - Do not simply repeat the student's current skills.
                - Focus on future and emerging skills.
                - Recommendations should be realistic for a
                  B.Tech Computer Science student.

                Provide:
                1. Future Skills
                2. Skill Gaps
                3. Suitable Career Roles
                4. Learning Roadmap
                5. Project Ideas

                Give clear and practical recommendations.
                """.formatted(
                education,
                sector,
                currentSkills
        );

        Map<String, Object> request = Map.of(
                "model", "llama3.2",
                "prompt", prompt,
                "stream", false
        );

        return callOllama(request);
    }


    // =====================================================
    // AI-BASED SKILL GAP ANALYSIS
    // =====================================================

    public String analyzeSkillGap(
            String education,
            String sector,
            String currentSkills) {

        String prompt = """
                You are SkillMapAI, an advanced AI-powered
                career and skill-gap analysis system.

                Your job is to evaluate a student's current
                skills against relevant IT industry skills.

                STUDENT PROFILE

                Education:
                %s

                Sector:
                %s

                Current Skills:
                %s

                YOUR TASK

                1. Understand the student's education, sector
                   and current technical skills.

                2. Identify industry-relevant skills for the
                   student's career direction.

                3. Compare current skills with industry skills.

                4. Calculate an overall skill match percentage.

                Match Percentage =
                (number of relevant industry skills the student has
                / total number of relevant industry skills) × 100

                5. Identify matched skills.

                6. Identify missing skills.

                7. Identify future and emerging skills.

                8. Recommend suitable career roles.

                9. Create a practical learning roadmap.

                10. Suggest practical projects.

                IMPORTANT RULES

                - Use AI-based analysis.
                - Do not use a fixed database skill list.
                - Do not recommend unrelated technologies.
                - Consider education and selected sector.
                - Match percentage must be between 0 and 100.
                - Return ONLY valid JSON.
                - Do not use Markdown.
                - Do not add explanations outside JSON.

                RETURN EXACTLY THIS JSON:

                {
                  "matchPercentage": 0,
                  "matchedSkills": [],
                  "missingSkills": [],
                  "prioritySkills": [],
                  "futureSkills": [],
                  "skillGapSummary": "",
                  "careerRoles": [],
                  "learningRoadmap": [],
                  "projectIdeas": []
                }

                Requirements:

                matchedSkills: 2 to 10
                missingSkills: 2 to 10
                prioritySkills: 2 to 5
                futureSkills: 3 to 6
                careerRoles: 2 to 4
                projectIdeas: 2 to 4

                """.formatted(
                education,
                sector,
                currentSkills
        );

        Map<String, Object> request = Map.of(
                "model", "llama3.2",
                "prompt", prompt,
                "stream", false,
                "format", "json"
        );

        return callOllama(request);
    }


    // =====================================================
    // AI CAREER RECOMMENDATIONS
    // =====================================================

    public String analyzeCareerRecommendations(
            String education,
            String sector,
            String currentSkills,
            String careerMatches) {

        String prompt = """
                You are SkillMapAI, an AI-powered career guidance
                assistant.

                Analyze the student's profile.

                Education:
                %s

                Sector:
                %s

                Current Skills:
                %s

                Existing Career Matching Information:
                %s

                Provide personalized career guidance.

                IMPORTANT:
                - Analyze the student's actual skills.
                - Do not invent unrelated careers.
                - Identify important missing skills.
                - Consider current and future industry trends.
                - Recommend realistic IT career paths.
                - Return ONLY valid JSON.
                - Do not use Markdown.
                - Do not add text outside JSON.

                RETURN EXACTLY:

                {
                  "careerSummary": "",
                  "topCareer": {
                    "careerName": "",
                    "reason": "",
                    "matchPercentage": 0
                  },
                  "careerRecommendations": [],
                  "recommendedSkills": [],
                  "learningPlan": [],
                  "projectIdeas": []
                }
                """.formatted(
                education,
                sector,
                currentSkills,
                careerMatches
        );

        Map<String, Object> request = Map.of(
                "model", "llama3.2",
                "prompt", prompt,
                "stream", false,
                "format", "json"
        );

        return callOllama(request);
    }


    // =====================================================
    // AI JOB RECOMMENDATIONS
    // =====================================================

    public String analyzeJobMatches(
            String education,
            String currentSkills,
            String jobMatches) {

        String prompt = """
                You are SkillMapAI, an AI-powered job guidance
                assistant.

                Student Education:
                %s

                Student Current Skills:
                %s

                Available Job Matching Information:
                %s

                Analyze the available jobs and provide
                personalized guidance.

                IMPORTANT:
                - Do not invent companies or jobs.
                - Use the provided job information.
                - Identify important missing skills.
                - Explain why jobs are suitable.
                - Recommend what the student should learn.
                - Suggest practical projects.
                - Return ONLY valid JSON.
                - Do not use Markdown.
                - Do not add text outside JSON.

                RETURN EXACTLY:

                {
                  "jobSummary": "",
                  "bestJob": {
                    "jobTitle": "",
                    "company": "",
                    "matchPercentage": 0,
                    "reason": ""
                  },
                  "jobRecommendations": [],
                  "prioritySkills": [],
                  "learningPlan": [],
                  "projectIdeas": []
                }
                """.formatted(
                education,
                currentSkills,
                jobMatches
        );

        Map<String, Object> request = Map.of(
                "model", "llama3.2",
                "prompt", prompt,
                "stream", false,
                "format", "json"
        );

        return callOllama(request);
    }


    // =====================================================
    // AI RESUME SKILL EXTRACTION
    // =====================================================

    public String extractSkillsFromResume(String resumeText) {

        String prompt = """
                You are SkillMapAI, an AI-powered resume analysis
                and skill extraction assistant.

                Analyze the following resume carefully.

                Extract information only from the provided resume.
                Do not invent skills, education, experience,
                projects or certifications.

                Identify:

                1. Candidate name
                2. Education
                3. Work experience
                4. Technical skills
                5. Soft skills
                6. Projects
                7. Certifications

                IMPORTANT RULES:

                - Return ONLY valid JSON.
                - Do not use Markdown.
                - Do not use ```json.
                - Do not add explanations outside JSON.
                - If information is not available, return an empty
                  string or empty array.
                - Keep technical skills separate from soft skills.
                - Extract programming languages, frameworks,
                  databases, cloud platforms and tools.
                - Do not assume information that is not present.

                RETURN EXACTLY THIS JSON FORMAT:

                {
                  "candidateName": "",
                  "education": [],
                  "experience": [],
                  "technicalSkills": [],
                  "softSkills": [],
                  "projects": [],
                  "certifications": []
                }

                RESUME TEXT:

                %s
                """.formatted(resumeText);

        Map<String, Object> request = Map.of(
                "model", "llama3.2",
                "prompt", prompt,
                "stream", false,
                "format", "json"
        );

        return callOllama(request);
    }


    // =====================================================
    // COMMON OLLAMA METHOD
    // =====================================================

    private String callOllama(Map<String, Object> request) {

        Map response = restClient.post()
                .uri("/api/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(Map.class);

        if (response == null ||
                response.get("response") == null) {

            throw new RuntimeException(
                    "No response received from Llama"
            );
        }

        return response.get("response").toString();
    }
}