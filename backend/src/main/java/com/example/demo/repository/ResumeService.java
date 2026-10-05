
package com.example.demo.repository;

import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.service.AIService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ResumeService {

    private final Tika tika = new Tika();

    private final AIService aiService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public ResumeService(AIService aiService) {
        this.aiService = aiService;
    }

    public Map<String, Object> processResume(
            MultipartFile file) throws Exception {

        // ==========================================
        // 1. VALIDATE FILE
        // ==========================================

        if (file == null || file.isEmpty()) {
            throw new RuntimeException(
                    "Please upload a file"
            );
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null || fileName.isBlank()) {
            throw new RuntimeException(
                    "Invalid file name"
            );
        }

        // ==========================================
        // 2. EXTRACT TEXT USING APACHE TIKA
        // ==========================================

        String extractedText;

        try (InputStream inputStream = file.getInputStream()) {
            extractedText = tika.parseToString(inputStream);
        }

        // ==========================================
        // 3. VALIDATE EXTRACTED TEXT
        // ==========================================

        if (extractedText == null || extractedText.isBlank()) {
            throw new RuntimeException(
                    "Could not extract text from resume"
            );
        }

        // ==========================================
        // 4. SEND RESUME TEXT TO OLLAMA AI
        // ==========================================

        String aiResponse = aiService.extractSkillsFromResume(
                extractedText
        );

        // ==========================================
        // 5. CONVERT AI STRING INTO JSON OBJECT
        // ==========================================

        Map<String, Object> aiAnalysis =
                objectMapper.readValue(
                        aiResponse,
                        new TypeReference<Map<String, Object>>() {}
                );

        // ==========================================
        // 6. PREPARE RESPONSE
        // ==========================================

        Map<String, Object> response = new LinkedHashMap<>();

        response.put(
                "fileName",
                fileName
        );

        response.put(
                "extractedText",
                extractedText
        );

        response.put(
                "aiAnalysis",
                aiAnalysis
        );

        // ==========================================
        // 7. RETURN RESULT
        // ==========================================

        return response;
    }
}