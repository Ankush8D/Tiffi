package com.tiffi.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private Long userId;
    private String phone;
    private String role;
    private String accessToken;
    private String refreshToken;
    private boolean isNewUser;
}
