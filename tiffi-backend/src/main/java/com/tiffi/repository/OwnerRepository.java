package com.tiffi.repository;

import com.tiffi.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByPhone(String phone);
    boolean existsByPhone(String phone);
}
