package com.tiffi.controller;

import com.tiffi.service.PaymentService;
import com.tiffi.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/record-cash")
    public ResponseEntity<Map<String, Object>> recordCash(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        Long ownerId = (Long) auth.getPrincipal();
        Long customerId = Long.valueOf(body.get("customerId").toString());
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String notes = (String) body.getOrDefault("notes", null);
        return ResponseUtil.success(paymentService.recordCash(customerId, ownerId, amount, notes), "Payment recorded");
    }

    @PostMapping("/create-razorpay-order")
    public ResponseEntity<Map<String, Object>> createOrder(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        Long ownerId = (Long) auth.getPrincipal();
        Long customerId = Long.valueOf(body.get("customerId").toString());
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        return ResponseUtil.success(paymentService.createRazorpayOrder(customerId, ownerId, amount));
    }

    @PostMapping("/verify-razorpay")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody Map<String, String> body) {
        return ResponseUtil.success(
                paymentService.verifyRazorpayPayment(body.get("orderId"), body.get("paymentId")),
                "Payment verified");
    }

    @GetMapping("/history/{customerId}")
    public ResponseEntity<Map<String, Object>> history(@PathVariable Long customerId) {
        return ResponseUtil.success(paymentService.getHistory(customerId));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(
            Authentication auth,
            @RequestParam int month,
            @RequestParam int year) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(paymentService.getMonthlySummary(ownerId, month, year));
    }
}
