package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.common.ApiResponse;
import com.vibgyor.ecommerce.dto.request.auth.LoginRequest;
import com.vibgyor.ecommerce.dto.request.auth.RegisterRequest;
import com.vibgyor.ecommerce.dto.response.auth.AuthResponse;
import com.vibgyor.ecommerce.dto.response.auth.LoginResponse;
import com.vibgyor.ecommerce.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;


    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }
}