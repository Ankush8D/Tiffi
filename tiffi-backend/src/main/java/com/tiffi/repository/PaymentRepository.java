package com.tiffi.repository;

import com.tiffi.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.ownerId = :ownerId AND p.status = 'paid' AND MONTH(p.paymentDate) = :month AND YEAR(p.paymentDate) = :year")
    BigDecimal sumCollectedByOwnerAndMonth(@Param("ownerId") Long ownerId, @Param("month") int month, @Param("year") int year);

    long countByOwnerIdAndStatus(Long ownerId, Payment.Status status);

    @Query("SELECT p FROM Payment p WHERE p.ownerId = :ownerId AND MONTH(p.createdAt) = :month AND YEAR(p.createdAt) = :year ORDER BY p.createdAt DESC")
    List<Payment> findByOwnerIdAndMonth(@Param("ownerId") Long ownerId, @Param("month") int month, @Param("year") int year);
}
