package com.tiffi.repository;

import com.tiffi.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByCustomerIdAndDateAndMealType(Long customerId, LocalDate date, Delivery.MealType mealType);

    List<Delivery> findByOwnerIdAndDate(Long ownerId, LocalDate date);

    @Query("SELECT d FROM Delivery d WHERE d.ownerId = :ownerId AND d.date = :date AND (:zone IS NULL OR EXISTS (SELECT c FROM Customer c WHERE c.id = d.customerId AND c.zone = :zone))")
    List<Delivery> findByOwnerDateAndZone(@Param("ownerId") Long ownerId, @Param("date") LocalDate date, @Param("zone") String zone);

    List<Delivery> findByCustomerIdAndDateBetween(Long customerId, LocalDate start, LocalDate end);

    long countByOwnerIdAndDateAndStatus(Long ownerId, LocalDate date, Delivery.Status status);
}
