package com.tiffi.controller;

import com.tiffi.entity.Leave;
import com.tiffi.service.LeaveService;
import com.tiffi.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> apply(
            Authentication auth,
            @RequestBody Map<String, String> body) {
        Long customerId = (Long) auth.getPrincipal();
        LocalDate date = LocalDate.parse(body.get("date"));
        Leave.MealType mealType = Leave.MealType.valueOf(body.get("mealType"));
        String reason = body.get("reason");
        return ResponseUtil.success(leaveService.applyLeave(customerId, date, mealType, reason), "Leave applied");
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approve(@PathVariable Long id) {
        return ResponseUtil.success(leaveService.reviewLeave(id, Leave.Status.approved), "Leave approved");
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> reject(@PathVariable Long id) {
        return ResponseUtil.success(leaveService.reviewLeave(id, Leave.Status.rejected), "Leave rejected");
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> myLeaves(Authentication auth) {
        Long customerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(leaveService.getCustomerLeaves(customerId));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> pendingLeaves(Authentication auth) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(leaveService.getPendingLeavesByOwner(ownerId));
    }
}
