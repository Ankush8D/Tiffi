package com.tiffi.controller;

import com.tiffi.service.MenuService;
import com.tiffi.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    // Both owner and customer can view today's menu
    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> getToday(Authentication auth) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(menuService.getTodayMenu(ownerId));
    }

    // Only owner sets menu
    @PostMapping
    public ResponseEntity<Map<String, Object>> setMenu(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(
                menuService.setMenu(ownerId, body.get("mealType"), body.get("description")),
                "Menu updated");
    }
}
