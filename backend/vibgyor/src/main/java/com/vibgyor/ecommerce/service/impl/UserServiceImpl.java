package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.response.user.UserProfileResponse;
import com.vibgyor.ecommerce.dto.response.user.UserResponse;
import com.vibgyor.ecommerce.dto.response.user.UserSummaryResponse;
import com.vibgyor.ecommerce.entity.User;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.entity.enums.UserRole;
import com.vibgyor.ecommerce.exception.ResourceNotFoundException;
import com.vibgyor.ecommerce.mapper.UserMapper;
import com.vibgyor.ecommerce.repository.UserRepo;
import com.vibgyor.ecommerce.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;

    @Override
    public UserResponse getUserById(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return userMapper.toUserResponse(user);
    }

    @Override
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return userMapper.toUserProfileResponse(user);
    }

    @Override
    public List<UserSummaryResponse> getAllUsers() {
        List<User> users = userRepo.findAll();
        return userMapper.toUserSummaryResponseList(users);
    }

    @Override
    public List<UserSummaryResponse> getUsersByRole(UserRole role) {
        List<User> users = userRepo.findByRole(role);
        return userMapper.toUserSummaryResponseList(users);
    }

    @Override
    public List<UserSummaryResponse> getUsersByStatus(Status status) {
        List<User> users = userRepo.findByStatus(status);
        return userMapper.toUserSummaryResponseList(users);
    }

    @Override
    public List<UserSummaryResponse> searchUsersByName(String keyword) {
        List<User> users = userRepo
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(keyword, keyword);
        return userMapper.toUserSummaryResponseList(users);
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long userId, Status status) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setStatus(status);
        User updatedUser = userRepo.save(user);

        return userMapper.toUserResponse(updatedUser);
    }
}