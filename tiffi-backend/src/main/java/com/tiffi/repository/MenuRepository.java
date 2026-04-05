package com.tiffi.repository;

import com.tiffi.entity.Menu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    Optional<Menu> findByOwnerIdAndDateAndMealType(Long ownerId, LocalDate date, Menu.MealType mealType);
    List<Menu> findByOwnerIdAndDateBetween(Long ownerId, LocalDate start, LocalDate end);
    List<Menu> findByOwnerIdAndDate(Long ownerId, LocalDate date);
}
