package com.tiffi.service;

import com.tiffi.entity.Customer;
import com.tiffi.entity.Leave;
import com.tiffi.entity.Owner;
import com.tiffi.exception.TiffiException;
import com.tiffi.repository.CustomerRepository;
import com.tiffi.repository.LeaveRepository;
import com.tiffi.repository.OwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final CustomerRepository customerRepository;
    private final OwnerRepository ownerRepository;

    @Transactional
    public Leave applyLeave(Long customerId, LocalDate date, Leave.MealType mealType, String reason) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> TiffiException.notFound("Customer not found"));

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        if (!date.equals(today) && !date.equals(tomorrow)) {
            throw TiffiException.badRequest("Leave can only be applied for today or tomorrow");
        }

        // Cutoff check for same-day leave
        if (date.equals(today)) {
            Owner owner = ownerRepository.findById(customer.getOwnerId())
                    .orElseThrow(() -> TiffiException.notFound("Owner not found"));
            LocalTime cutoff = owner.getDefaultCutoffTime();
            if (LocalTime.now().isAfter(cutoff)) {
                throw TiffiException.badRequest("Same-day leave cutoff time (" + cutoff + ") has passed");
            }
        }

        Leave leave = Leave.builder()
                .customerId(customerId)
                .date(date)
                .mealType(mealType)
                .reason(reason)
                .status(Leave.Status.pending)
                .build();

        return leaveRepository.save(leave);
    }

    @Transactional
    public Leave reviewLeave(Long leaveId, Leave.Status status) {
        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> TiffiException.notFound("Leave not found"));
        if (leave.getStatus() != Leave.Status.pending) {
            throw TiffiException.badRequest("Leave has already been reviewed");
        }
        leave.setStatus(status);
        leave.setReviewedAt(LocalDateTime.now());
        return leaveRepository.save(leave);
    }

    public List<Leave> getCustomerLeaves(Long customerId) {
        return leaveRepository.findByCustomerId(customerId);
    }

    public List<Leave> getPendingLeavesByOwner(Long ownerId) {
        // Get all customer IDs for this owner, then find their pending leaves
        List<Long> customerIds = customerRepository
                .findByOwnerIdWithFilters(ownerId, Customer.Status.active, null, null,
                        org.springframework.data.domain.PageRequest.of(0, 10000))
                .map(Customer::getId).toList();
        return leaveRepository.findByCustomerIdIn(customerIds)
                .stream().filter(l -> l.getStatus() == Leave.Status.pending).toList();
    }
}
