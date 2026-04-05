package com.tiffi.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VerifyTokenRequest {
    @NotBlank(message = "Firebase ID token is required")
    private String idToken;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "OWNER|CUSTOMER|DELIVERY_BOY", message = "Role must be OWNER, CUSTOMER, or DELIVERY_BOY")
    private String role;
}
