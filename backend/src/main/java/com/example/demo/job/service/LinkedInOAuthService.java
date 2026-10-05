package com.example.demo.job.service;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.example.demo.job.entity.LinkedInProfile;
import com.example.demo.job.service.LinkedInProfileService;

@Service
public class LinkedInOAuthService {

    @Value("${linkedin.client-id}")
    private String clientId;

    @Value("${linkedin.client-secret}")
    private String clientSecret;

    @Value("${linkedin.redirect-uri}")
    private String redirectUri;

    private final RestClient restClient;
    private final LinkedInProfileService linkedInProfileService;

    public LinkedInOAuthService(
            LinkedInProfileService linkedInProfileService) {

        this.restClient = RestClient.create();
        this.linkedInProfileService = linkedInProfileService;
    }

    public String getAuthorizationUrl(Long userId) {

        return "https://www.linkedin.com/oauth/v2/authorization"
                + "?response_type=code"
                + "&client_id=" + clientId
                + "&redirect_uri=" + redirectUri
                + "&scope=openid%20profile%20email"
                + "&state=" + userId;
    }

    public String exchangeCodeForAccessToken(
            String code,
            Long userId) {

        String body =
                "grant_type=authorization_code"
                + "&code=" + encode(code)
                + "&client_id=" + encode(clientId)
                + "&client_secret=" + encode(clientSecret)
                + "&redirect_uri=" + encode(redirectUri);

        Map response = restClient.post()
                .uri("https://www.linkedin.com/oauth/v2/accessToken")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (response == null ||
                response.get("access_token") == null) {

            throw new RuntimeException(
                    "LinkedIn access token was not received");
        }

        String accessToken =
                response.get("access_token").toString();

        Map profile = restClient.get()
                .uri("https://api.linkedin.com/v2/userinfo")
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + accessToken)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(Map.class);

        if (profile == null) {

            throw new RuntimeException(
                    "LinkedIn profile was not received");
        }

        LinkedInProfile linkedInProfile =
                new LinkedInProfile();

        linkedInProfile.setLinkedinId(
                getValue(profile, "sub"));

        linkedInProfile.setName(
                getValue(profile, "name"));

        linkedInProfile.setEmail(
                getValue(profile, "email"));

        linkedInProfile.setPicture(
                getValue(profile, "picture"));

        linkedInProfileService.saveProfile(
                userId,
                linkedInProfile);

        return "LinkedIn profile connected successfully";
    }

    private String getValue(
            Map profile,
            String key) {

        Object value = profile.get(key);

        return value != null
                ? value.toString()
                : null;
    }

    private String encode(String value) {

        return java.net.URLEncoder
                .encode(value, StandardCharsets.UTF_8);
    }
}