package com.vibgyor.ecommerce.mapper;

import com.vibgyor.ecommerce.dto.request.auth.RegisterRequest;
import com.vibgyor.ecommerce.dto.response.auth.AuthResponse;
import com.vibgyor.ecommerce.dto.response.auth.LoginResponse;
import com.vibgyor.ecommerce.entity.User;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.entity.enums.UserRole;

public class AuthMapper {

    private AuthMapper() {
    }

    public static User toEntity(RegisterRequest request, String encodedPassword) {
        if (request == null) {
            return null;
        }

        return User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(encodedPassword)
                .mobile(request.getMobile())
                .role(UserRole.USER)
                .status(Status.ACTIVE)
                .build();
    }

    public static AuthResponse toAuthResponse(User user, String message, String token) {
        if (user == null) {
            return null;
        }

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .message(message)
                .token(token)
                .build();
    }

    public static LoginResponse toLoginResponse(User user, String message, String token) {
        if (user == null) {
            return null;
        }

        return LoginResponse.builder()
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .message(message)
                .token(token)
                .build();
    }
}