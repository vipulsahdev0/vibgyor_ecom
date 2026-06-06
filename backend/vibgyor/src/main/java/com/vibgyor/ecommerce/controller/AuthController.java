package com.vibgyor.ecommerce.controller;

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
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}