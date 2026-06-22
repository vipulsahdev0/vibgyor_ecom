package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.user.ChangePasswordRequest;
import com.vibgyor.ecommerce.dto.request.user.UpdateProfileRequest;
import com.vibgyor.ecommerce.dto.response.user.UserProfileResponse;
import com.vibgyor.ecommerce.dto.response.user.UserResponse;
import com.vibgyor.ecommerce.dto.response.user.UserSummaryResponse;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.entity.enums.UserRole;

import java.util.List;

public interface UserService {

    // Get one user by ID
    UserResponse getUserById(Long userId);

    // Get user profile details
    UserProfileResponse getUserProfile(Long userId);

    UserResponse updateProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    // Get all users
    List<UserSummaryResponse> getAllUsers();

    // Get users by role
    List<UserSummaryResponse> getUsersByRole(UserRole role);

    // Get users by status
    List<UserSummaryResponse> getUsersByStatus(Status status);

    // Search users by first name or last name
    List<UserSummaryResponse> searchUsersByName(String keyword);

    // Update user status (ACTIVE / INACTIVE etc.)
    UserResponse updateUserStatus(Long userId, Status status);
}