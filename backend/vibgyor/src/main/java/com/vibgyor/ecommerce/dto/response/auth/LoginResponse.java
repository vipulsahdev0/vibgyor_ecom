package com.vibgyor.ecommerce.dto.response.auth;

import com.vibgyor.ecommerce.entity.enums.UserRole;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;
    private String message;
    private String token;
}