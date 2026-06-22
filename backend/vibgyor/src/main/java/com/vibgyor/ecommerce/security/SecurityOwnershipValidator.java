// package com.vibgyor.ecommerce.security;

package com.vibgyor.ecommerce.security;

import com.vibgyor.ecommerce.exception.ForbiddenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityOwnershipValidator {

    /**
     * Throws ForbiddenException if the currently authenticated user is neither
     * an ADMIN nor the owner of the resource identified by resourceUserId.
     */
    public void validateOwnerOrAdmin(Long resourceUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ForbiddenException("Not authenticated");
        }

        CustomUserDetails principal = (CustomUserDetails) auth.getPrincipal();
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !principal.getUserId().equals(resourceUserId)) {
            throw new ForbiddenException("Access denied: you can only access your own resources");
        }
    }

    /** Returns the userId of the currently logged-in user. */
    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ForbiddenException("Not authenticated");
        }
        return ((CustomUserDetails) auth.getPrincipal()).getUserId();
    }
}