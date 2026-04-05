package com.tiffi.controller;

import com.tiffi.dto.request.VerifyTokenRequest;
import com.tiffi.dto.response.AuthResponse;
import com.tiffi.service.AuthService;
import com.tiffi.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@Valid @RequestBody VerifyTokenRequest request) {
        AuthResponse response = authService.verifyFirebaseToken(request);
        return ResponseUtil.success(response, "Authentication successful");
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseUtil.success(response);
    }
}
