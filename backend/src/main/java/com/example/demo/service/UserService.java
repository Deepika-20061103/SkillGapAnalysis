package com.example.demo.service;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =====================================================
    // CREATE USER - EXISTING METHOD
    // =====================================================

    public User createUser(User user) {
        return userRepository.save(user);
    }


    // =====================================================
    // REGISTER NEW USER
    // =====================================================

    public User registerUser(User user) {

        if (user.getName() == null ||
                user.getName().trim().isEmpty()) {

            throw new RuntimeException("Name is required");
        }

        if (user.getEmail() == null ||
                user.getEmail().trim().isEmpty()) {

            throw new RuntimeException("Email is required");
        }

        if (user.getPassword() == null ||
                user.getPassword().length() < 6) {

            throw new RuntimeException(
                    "Password must contain at least 6 characters"
            );
        }

        if (user.getEducation() == null ||
                user.getEducation().trim().isEmpty()) {

            throw new RuntimeException("Education is required");
        }

        if (user.getSector() == null) {

            throw new RuntimeException("Sector is required");
        }

        String email =
                user.getEmail().trim().toLowerCase();

        // Check if email already exists
        Optional<User> existingUser =
                findByEmail(email);

        if (existingUser.isPresent()) {

            throw new RuntimeException(
                    "An account with this email already exists"
            );
        }

        // Generate random salt
        byte[] salt = new byte[16];

        new SecureRandom().nextBytes(salt);

        // Hash password
        String passwordHash =
                hashPassword(
                        user.getPassword(),
                        salt
                );

        user.setEmail(email);

        user.setPasswordHash(passwordHash);

        user.setPasswordSalt(
                Base64.getEncoder()
                        .encodeToString(salt)
        );

        // Never store plain password
        user.setPassword(null);

        return userRepository.save(user);
    }


    // =====================================================
    // LOGIN EXISTING USER
    // =====================================================

    public User login(
            String email,
            String password) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (password == null ||
                password.isEmpty()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        User user =
                findByEmail(
                        email.trim().toLowerCase()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );

        // Old users may not have a password
        if (user.getPasswordHash() == null ||
                user.getPasswordSalt() == null) {

            throw new RuntimeException(
                    "This account does not have a password. " +
                    "Please use User ID login or create a new account."
            );
        }

        byte[] salt =
                Base64.getDecoder().decode(
                        user.getPasswordSalt()
                );

        String enteredPasswordHash =
                hashPassword(
                        password,
                        salt
                );

        if (!enteredPasswordHash.equals(
                user.getPasswordHash())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        // Don't return plain password
        user.setPassword(null);

        return user;
    }


    // =====================================================
    // FIND USER BY EMAIL
    // =====================================================

    private Optional<User> findByEmail(
            String email) {

        return userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getEmail() != null &&
                        user.getEmail()
                                .equalsIgnoreCase(email)
                )
                .findFirst();
    }


    // =====================================================
    // PASSWORD HASHING
    // =====================================================

    private String hashPassword(
            String password,
            byte[] salt) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            digest.update(salt);

            byte[] hash =
                    digest.digest(
                            password.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return Base64.getEncoder()
                    .encodeToString(hash);

        } catch (NoSuchAlgorithmException e) {

            throw new RuntimeException(
                    "Password hashing failed",
                    e
            );
        }
    }


    // =====================================================
    // GET ALL USERS
    // =====================================================

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


    // =====================================================
    // GET USER BY ID
    // =====================================================

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }


    // =====================================================
    // UPDATE USER
    // =====================================================

    public User updateUser(
            Long id,
            User updatedUser) {

        User existingUser =
                userRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"
                                ));

        existingUser.setName(
                updatedUser.getName()
        );

        existingUser.setEmail(
                updatedUser.getEmail()
        );

        existingUser.setEducation(
                updatedUser.getEducation()
        );

        existingUser.setSector(
                updatedUser.getSector()
        );

        return userRepository.save(existingUser);
    }


    // =====================================================
    // DELETE USER
    // =====================================================

    public void deleteUser(Long id) {

        userRepository.deleteById(id);
    }
}