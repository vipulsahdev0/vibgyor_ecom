package com.vibgyor.ecommerce.exception;

import java.time.LocalDateTime;
import java.util.List;

public record ApiErrorResponse(
        String timestamp,
        int status,
        String error,
        String message,
        String path,
        List<String> details
) {
}