package com.vibgyor.ecommerce.util;

import com.vibgyor.ecommerce.entity.User;
import com.vibgyor.ecommerce.exception.ResourceNotFoundException;
import com.vibgyor.ecommerce.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserLookupHelper {

    private final UserRepo userRepo;

    public User findById(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

//    User user = userLookupHelper.findById(userId);

}