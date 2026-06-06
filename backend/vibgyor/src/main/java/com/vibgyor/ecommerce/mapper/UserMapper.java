package com.vibgyor.ecommerce.mapper;

import com.vibgyor.ecommerce.dto.response.user.UserProfileResponse;
import com.vibgyor.ecommerce.dto.response.user.UserResponse;
import com.vibgyor.ecommerce.dto.response.user.UserSummaryResponse;
import com.vibgyor.ecommerce.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponse toUserResponse(User user) {
        if (user == null) return null;

        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public UserSummaryResponse toUserSummaryResponse(User user) {
        if (user == null) return null;

        return UserSummaryResponse.builder()
                .id(user.getId())
                .fullName(buildFullName(user.getFirstName(), user.getLastName()))
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    public UserProfileResponse toUserProfileResponse(User user) {
        if (user == null) return null;

        int addressCount = user.getAddresses() != null ? user.getAddresses().size() : 0;
        int orderCount = user.getOrders() != null ? user.getOrders().size() : 0;

        return UserProfileResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(buildFullName(user.getFirstName(), user.getLastName()))
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole())
                .status(user.getStatus())
                .addressCount(addressCount)
                .orderCount(orderCount)
                .build();
    }

    public List<UserResponse> toUserResponseList(List<User> users) {
        if (users == null) return List.of();
        return users.stream().map(this::toUserResponse).collect(Collectors.toList());
    }

    public List<UserSummaryResponse> toUserSummaryResponseList(List<User> users) {
        if (users == null) return List.of();
        return users.stream().map(this::toUserSummaryResponse).collect(Collectors.toList());
    }

    private String buildFullName(String firstName, String lastName) {
        String first = firstName != null ? firstName.trim() : "";
        String last = lastName != null ? lastName.trim() : "";
        return (first + " " + last).trim();
    }
}