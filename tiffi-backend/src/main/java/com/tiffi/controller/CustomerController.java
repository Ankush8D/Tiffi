package com.tiffi.controller;

import com.tiffi.entity.Customer;
import com.tiffi.service.CustomerService;
import com.tiffi.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('OWNER')")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            Authentication auth,
            @RequestParam(required = false) Customer.Status status,
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(customerService.getCustomers(ownerId, status, zone, search, page));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            Authentication auth,
            @RequestBody Customer customer) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(customerService.createCustomer(ownerId, customer), "Customer created");
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> get(Authentication auth, @PathVariable Long id) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(customerService.getCustomer(id, ownerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            Authentication auth,
            @PathVariable Long id,
            @RequestBody Customer updates) {
        Long ownerId = (Long) auth.getPrincipal();
        return ResponseUtil.success(customerService.updateCustomer(id, ownerId, updates), "Customer updated");
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            Authentication auth,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        Long ownerId = (Long) auth.getPrincipal();
        Customer.Status status = Customer.Status.valueOf(body.get("status"));
        return ResponseUtil.success(customerService.updateStatus(id, ownerId, status), "Status updated");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(Authentication auth, @PathVariable Long id) {
        Long ownerId = (Long) auth.getPrincipal();
        customerService.deleteCustomer(id, ownerId);
        return ResponseUtil.success(null, "Customer deleted");
    }
}
