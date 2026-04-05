package com.tiffi.controller;

import com.tiffi.entity.Delivery;
import com.tiffi.service.DeliveryService;
import com.tiffi.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> getToday(
            Authentication auth,
            @RequestParam(required = false) String zone) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(deliveryService.getTodayList(ownerId, zone));
    }

    @PostMapping("/mark")
    public ResponseEntity<Map<String, Object>> mark(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        Long ownerId = (Long) auth.getPrincipal();
        Long customerId = Long.valueOf(body.get("customerId").toString());
        LocalDate date = LocalDate.parse(body.get("date").toString());
        Delivery.MealType mealType = Delivery.MealType.valueOf(body.get("mealType").toString());
        Delivery.Status status = Delivery.Status.valueOf(body.get("status").toString());
        return ResponseUtil.success(deliveryService.markDelivery(ownerId, customerId, date, mealType, status, ownerId));
    }

    @PostMapping("/mark-batch")
    public ResponseEntity<Map<String, Object>> markBatch(
            Authentication auth,
            @RequestBody List<Map<String, Object>> marks) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(deliveryService.markBatch(ownerId, marks, ownerId));
    }

    @GetMapping("/history/{customerId}")
    public ResponseEntity<Map<String, Object>> history(
            @PathVariable Long customerId,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseUtil.success(deliveryService.getHistory(customerId, month, year));
    }
}
