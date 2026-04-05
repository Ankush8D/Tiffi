package com.tiffi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "owners")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@SQLRestriction("is_deleted = false")
public class Owner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 15)
    private String phone;

    @Column(name = "business_name", nullable = false, length = 150)
    private String businessName;

    @Column(name = "business_logo_url", length = 500)
    private String businessLogoUrl;

    @Column(name = "upi_id", length = 100)
    private String upiId;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "working_days_per_month")
    private Integer workingDaysPerMonth = 26;

    @Column(name = "default_cutoff_time")
    private LocalTime defaultCutoffTime = LocalTime.of(10, 0);

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
