package com.tiffi.repository;

import com.tiffi.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findByOwnerIdAndIsActiveTrue(Long ownerId);
}
