package com.tiffi.repository;

import com.tiffi.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveRepository extends JpaRepository<Leave, Long> {
    List<Leave> findByCustomerId(Long customerId);
    List<Leave> findByCustomerIdIn(List<Long> customerIds);
    Optional<Leave> findByCustomerIdAndDateAndStatusIn(Long customerId, LocalDate date, List<Leave.Status> statuses);
    long countByCustomerIdAndStatus(Long customerId, Leave.Status status);
}
