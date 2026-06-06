package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.auth.LoginRequest;
import com.vibgyor.ecommerce.dto.request.auth.RegisterRequest;
import com.vibgyor.ecommerce.dto.response.auth.AuthResponse;
import com.vibgyor.ecommerce.dto.response.auth.LoginResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}