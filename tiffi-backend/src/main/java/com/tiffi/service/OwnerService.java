package com.tiffi.service;

import com.tiffi.entity.Owner;
import com.tiffi.exception.TiffiException;
import com.tiffi.repository.*;
import com.tiffi.entity.Customer;
import com.tiffi.entity.Delivery;
import com.tiffi.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OwnerService {

    private final OwnerRepository ownerRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryRepository deliveryRepository;
    private final PaymentRepository paymentRepository;

    public Owner getOwner(Long ownerId) {
        return ownerRepository.findById(ownerId)
                .orElseThrow(() -> TiffiException.notFound("Owner not found"));
    }

    public Map<String, Object> getDashboard(Long ownerId) {
        LocalDate today = LocalDate.now();

        long totalActive = customerRepository.countByOwnerIdAndStatus(ownerId, Customer.Status.active);
        long deliveredToday = deliveryRepository.countByOwnerIdAndDateAndStatus(ownerId, today, Delivery.Status.delivered);
        long pendingToday = deliveryRepository.countByOwnerIdAndDateAndStatus(ownerId, today, Delivery.Status.pending);
        long pendingPayments = paymentRepository.countByOwnerIdAndStatus(ownerId, Payment.Status.pending);

        List<Customer> lowTiffin = customerRepository.findLowTiffinCustomers(ownerId);
        List<Customer> expiring = customerRepository.findExpiringCustomers(ownerId, today.plusDays(7));

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("totalActiveCustomers", totalActive);
        dashboard.put("deliveredToday", deliveredToday);
        dashboard.put("pendingToday", pendingToday);
        dashboard.put("pendingPayments", pendingPayments);
        dashboard.put("lowTiffinCount", lowTiffin.size());
        dashboard.put("lowTiffinCustomers", lowTiffin.stream().map(c -> Map.of(
                "id", c.getId(),
                "name", c.getName(),
                "customerCode", c.getCustomerCode(),
                "tiffinsRemaining", c.getTiffinsRemaining()
        )).toList());
        dashboard.put("expiringCount", expiring.size());
        dashboard.put("expiringCustomers", expiring.stream().map(c -> Map.of(
                "id", c.getId(),
                "name", c.getName(),
                "customerCode", c.getCustomerCode(),
                "subscriptionEnd", c.getSubscriptionEnd().toString()
        )).toList());

        return dashboard;
    }

    @Transactional
    public Owner updateProfile(Long ownerId, Map<String, Object> updates) {
        Owner owner = getOwner(ownerId);
        if (updates.containsKey("name")) owner.setName((String) updates.get("name"));
        if (updates.containsKey("businessName")) owner.setBusinessName((String) updates.get("businessName"));
        if (updates.containsKey("businessLogoUrl")) owner.setBusinessLogoUrl((String) updates.get("businessLogoUrl"));
        if (updates.containsKey("upiId")) owner.setUpiId((String) updates.get("upiId"));
        if (updates.containsKey("address")) owner.setAddress((String) updates.get("address"));
        if (updates.containsKey("workingDaysPerMonth"))
            owner.setWorkingDaysPerMonth((Integer) updates.get("workingDaysPerMonth"));
        return ownerRepository.save(owner);
    }
}
