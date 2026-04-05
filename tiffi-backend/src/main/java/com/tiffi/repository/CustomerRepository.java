package com.tiffi.repository;

import com.tiffi.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByPhone(String phone);

    @Query("SELECT MAX(CAST(SUBSTRING(c.customerCode, 4) AS int)) FROM Customer c WHERE c.ownerId = :ownerId")
    Integer findMaxCustomerCodeNumber(@Param("ownerId") Long ownerId);

    Page<Customer> findByOwnerId(Long ownerId, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.ownerId = :ownerId " +
           "AND (:status IS NULL OR c.status = :status) " +
           "AND (:zone IS NULL OR c.zone = :zone) " +
           "AND (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR c.customerCode LIKE CONCAT('%', :search, '%'))")
    Page<Customer> findByOwnerIdWithFilters(
            @Param("ownerId") Long ownerId,
            @Param("status") Customer.Status status,
            @Param("zone") String zone,
            @Param("search") String search,
            Pageable pageable);

    long countByOwnerIdAndStatus(Long ownerId, Customer.Status status);

    @Query("SELECT c FROM Customer c WHERE c.ownerId = :ownerId AND c.tiffinsRemaining <= 5 AND c.status = 'active'")
    java.util.List<Customer> findLowTiffinCustomers(@Param("ownerId") Long ownerId);

    @Query("SELECT c FROM Customer c WHERE c.ownerId = :ownerId AND c.subscriptionEnd BETWEEN CURRENT_DATE AND :endDate AND c.status = 'active'")
    java.util.List<Customer> findExpiringCustomers(@Param("ownerId") Long ownerId, @Param("endDate") java.time.LocalDate endDate);
}
