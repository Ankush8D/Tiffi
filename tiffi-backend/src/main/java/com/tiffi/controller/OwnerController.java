package com.tiffi.controller;

import com.tiffi.service.OwnerService;
import com.tiffi.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/owner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class OwnerController {

    private final OwnerService ownerService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication auth) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(ownerService.getDashboard(ownerId));
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication auth) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(ownerService.getOwner(ownerId));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            Authentication auth,
            @RequestBody Map<String, Object> updates) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(ownerService.updateProfile(ownerId, updates), "Profile updated");
    }
}
