package com.tiffi.service;

import com.tiffi.entity.Customer;
import com.tiffi.entity.Delivery;
import com.tiffi.entity.Leave;
import com.tiffi.exception.TiffiException;
import com.tiffi.repository.CustomerRepository;
import com.tiffi.repository.DeliveryRepository;
import com.tiffi.repository.LeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final CustomerRepository customerRepository;
    private final LeaveRepository leaveRepository;

    public List<Map<String, Object>> getTodayList(Long ownerId, String zone) {
        LocalDate today = LocalDate.now();
        List<Customer> customers = zone != null
                ? customerRepository.findByOwnerIdWithFilters(ownerId, Customer.Status.active, zone, null,
                        org.springframework.data.domain.PageRequest.of(0, 1000)).getContent()
                : customerRepository.findByOwnerIdWithFilters(ownerId, Customer.Status.active, null, null,
                        org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Customer customer : customers) {
            // Check for approved leave today
            Optional<Leave> approvedLeave = leaveRepository.findByCustomerIdAndDateAndStatusIn(
                    customer.getId(), today, List.of(Leave.Status.approved));

            // Get or create delivery records
            for (Delivery.MealType mealType : getMealTypes(customer)) {
                Optional<Delivery> existing = deliveryRepository
                        .findByCustomerIdAndDateAndMealType(customer.getId(), today, mealType);

                Map<String, Object> item = new HashMap<>();
                item.put("customerId", customer.getId());
                item.put("customerCode", customer.getCustomerCode());
                item.put("name", customer.getName());
                item.put("zone", customer.getZone());
                item.put("mealType", mealType.name());
                item.put("status", existing.map(d -> d.getStatus().name()).orElse("pending"));
                item.put("hasApprovedLeave", approvedLeave.isPresent());
                item.put("photoUrl", customer.getPhotoUrl());
                result.add(item);
            }
        }
        return result;
    }

    @Transactional
    public Map<String, Object> markDelivery(Long ownerId, Long customerId, LocalDate date,
                                             Delivery.MealType mealType, Delivery.Status status, Long markedBy) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> TiffiException.notFound("Customer not found"));
        if (!customer.getOwnerId().equals(ownerId)) throw TiffiException.forbidden("Access denied");

        // Check for approved leave
        if (status == Delivery.Status.delivered) {
            Optional<Leave> approvedLeave = leaveRepository.findByCustomerIdAndDateAndStatusIn(
                    customerId, date, List.of(Leave.Status.approved));
            if (approvedLeave.isPresent()) {
                throw TiffiException.badRequest("Customer has approved leave for this meal");
            }
        }

        // Idempotent: get or create
        Optional<Delivery> existing = deliveryRepository.findByCustomerIdAndDateAndMealType(customerId, date, mealType);
        boolean wasAlreadyDelivered = existing.map(d -> d.getStatus() == Delivery.Status.delivered).orElse(false);

        Delivery delivery = existing.orElse(Delivery.builder()
                .customerId(customerId)
                .ownerId(ownerId)
                .date(date)
                .mealType(mealType)
                .build());

        delivery.setStatus(status);
        delivery.setMarkedBy(markedBy);
        delivery.setMarkedAt(LocalDateTime.now());
        deliveryRepository.save(delivery);

        // Decrement tiffin count only on transition to delivered (idempotent)
        if (status == Delivery.Status.delivered && !wasAlreadyDelivered) {
            if (customer.getTiffinsRemaining() > 0) {
                customer.setTiffinsRemaining(customer.getTiffinsRemaining() - 1);
                customerRepository.save(customer);
            }
        }

        return Map.of("success", true, "status", status.name(), "tiffinsRemaining", customer.getTiffinsRemaining());
    }

    @Transactional
    public Map<String, Object> markBatch(Long ownerId, List<Map<String, Object>> marks, Long markedBy) {
        List<Object> success = new ArrayList<>();
        List<Object> failed = new ArrayList<>();

        for (Map<String, Object> mark : marks) {
            try {
                Long customerId = Long.valueOf(mark.get("customerId").toString());
                LocalDate date = LocalDate.parse(mark.get("date").toString());
                Delivery.MealType mealType = Delivery.MealType.valueOf(mark.get("mealType").toString());
                Delivery.Status status = Delivery.Status.valueOf(mark.get("status").toString());
                markDelivery(ownerId, customerId, date, mealType, status, markedBy);
                success.add(customerId);
            } catch (Exception e) {
                failed.add(Map.of("item", mark, "error", e.getMessage()));
            }
        }
        return Map.of("success", success, "failed", failed);
    }

    public List<Map<String, Object>> getHistory(Long customerId, int month, int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        List<Delivery> deliveries = deliveryRepository.findByCustomerIdAndDateBetween(customerId, start, end);

        return deliveries.stream().map(d -> {
            Map<String, Object> item = new HashMap<>();
            item.put("date", d.getDate().toString());
            item.put("mealType", d.getMealType().name());
            item.put("status", d.getStatus().name());
            return item;
        }).toList();
    }

    private List<Delivery.MealType> getMealTypes(Customer customer) {
        // Determine meal types from their package
        // Default: both lunch and dinner
        return List.of(Delivery.MealType.lunch, Delivery.MealType.dinner);
    }
}
