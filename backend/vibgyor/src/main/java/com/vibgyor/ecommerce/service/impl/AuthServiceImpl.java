package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.auth.LoginRequest;
import com.vibgyor.ecommerce.dto.request.auth.RegisterRequest;
import com.vibgyor.ecommerce.dto.response.auth.AuthResponse;
import com.vibgyor.ecommerce.dto.response.auth.LoginResponse;
import com.vibgyor.ecommerce.entity.Cart;
import com.vibgyor.ecommerce.entity.User;
import com.vibgyor.ecommerce.entity.Wishlist;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.mapper.AuthMapper;
import com.vibgyor.ecommerce.repository.CartRepo;
import com.vibgyor.ecommerce.repository.UserRepo;
import com.vibgyor.ecommerce.repository.WishlistRepo;
import com.vibgyor.ecommerce.security.CustomUserDetails;
import com.vibgyor.ecommerce.security.JwtService;
import com.vibgyor.ecommerce.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private final CartRepo cartRepo;
    private final WishlistRepo wishlistRepo;

    @Override
    public AuthResponse register(RegisterRequest request) {

        validateRegisterRequest(request);

        if (userRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException(
                    "User already exists with email " + request.getEmail()
            );
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = AuthMapper.toEntity(request, encodedPassword);

        User savedUser = userRepo.save(user);

        if (cartRepo.findByUserId(savedUser.getId()).isEmpty()) {
            Cart cart = Cart.builder()
                    .user(savedUser)
                    .build();

            cartRepo.save(cart);
        }

        if (wishlistRepo.findByUserId(savedUser.getId()).isEmpty()) {
            Wishlist wishlist = Wishlist.builder()
                    .user(savedUser)
                    .build();

            wishlistRepo.save(wishlist);
        }

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);

        String token = jwtService.generateToken(
                userDetails,
                Map.of(
                        "userId", savedUser.getId(),
                        "role", savedUser.getRole().name()
                )
        );

        return AuthMapper.toAuthResponse(
                savedUser,
                "User registered successfully",
                token
        );
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (user.getStatus() != Status.ACTIVE) {
            throw new RuntimeException("User account is not active");
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);

        String token = jwtService.generateToken(
                userDetails,
                Map.of(
                        "userId", user.getId(),
                        "role", user.getRole().name()
                )
        );

        return AuthMapper.toLoginResponse(user, "Login successful", token);
    }

    private void validateRegisterRequest(RegisterRequest request) {
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }

        if (request.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long");
        }
    }
}