package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.response.user.UserProfileResponse;
import com.vibgyor.ecommerce.dto.response.user.UserResponse;
import com.vibgyor.ecommerce.dto.response.user.UserSummaryResponse;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.entity.enums.UserRole;
import com.vibgyor.ecommerce.service.UserService;
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

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.userId")
    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserProfile(userId));
    }

    @GetMapping
    public ResponseEntity<List<UserSummaryResponse>> getUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) String keyword
    ) {
        if (role != null) {
            return ResponseEntity.ok(userService.getUsersByRole(role));
        }
        if (status != null) {
            return ResponseEntity.ok(userService.getUsersByStatus(status));
        }
        if (keyword != null && !keyword.isBlank()) {
            return ResponseEntity.ok(userService.searchUsersByName(keyword));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam Status status
    ) {
        return ResponseEntity.ok(userService.updateUserStatus(userId, status));
    }
}