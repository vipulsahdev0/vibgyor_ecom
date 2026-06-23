package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.common.ApiResponse;
import com.vibgyor.ecommerce.dto.request.user.ChangePasswordRequest;
import com.vibgyor.ecommerce.dto.request.user.UpdateProfileRequest;
import com.vibgyor.ecommerce.dto.response.user.UserProfileResponse;
import com.vibgyor.ecommerce.dto.response.user.UserResponse;
import com.vibgyor.ecommerce.dto.response.user.UserSummaryResponse;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.entity.enums.UserRole;
import com.vibgyor.ecommerce.service.UserService;
import com.vibgyor.ecommerce.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails principal) {

        Long userId = principal.getUserId();
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.ok("Current user fetched successfully", user));
    }

    @GetMapping("/me/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUserProfile(
            @AuthenticationPrincipal CustomUserDetails principal) {

        Long userId = principal.getUserId();
        UserProfileResponse profile = userService.getUserProfile(userId);
        return ResponseEntity.ok(ApiResponse.ok("Current user profile fetched successfully", profile));
    }

    // Optional: restrict to owner or admin for security
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.userId")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("User fetched successfully",
                userService.getUserById(userId)));
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.userId")
    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("User profile fetched successfully",
                userService.getUserProfile(userId)));
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.userId")
    @PatchMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserResponse updated = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.userId")
    @PatchMapping("/{userId}/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {

        userService.changePassword(userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) String keyword) {

        List<UserSummaryResponse> users;
        if (role != null) {
            users = userService.getUsersByRole(role);
        } else if (status != null) {
            users = userService.getUsersByStatus(status);
        } else if (keyword != null && !keyword.isBlank()) {
            users = userService.searchUsersByName(keyword);
        } else {
            users = userService.getAllUsers();
        }
        return ResponseEntity.ok(ApiResponse.ok("Users fetched successfully", users));
    }

    // Recommended: admin-only
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam Status status) {
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully",
                userService.updateUserStatus(userId, status)));
    }
}