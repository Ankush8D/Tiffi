package com.tiffi.service;

import com.tiffi.entity.Customer;
import com.tiffi.exception.TiffiException;
import com.tiffi.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public Page<Customer> getCustomers(Long ownerId, Customer.Status status, String zone, String search, int page) {
        Pageable pageable = PageRequest.of(page, 20, Sort.by("createdAt").descending());
        return customerRepository.findByOwnerIdWithFilters(ownerId, status, zone, search, pageable);
    }

    public Customer getCustomer(Long customerId, Long ownerId) {
        Customer c = customerRepository.findById(customerId)
                .orElseThrow(() -> TiffiException.notFound("Customer not found"));
        if (!c.getOwnerId().equals(ownerId)) throw TiffiException.forbidden("Access denied");
        return c;
    }

    @Transactional
    public Customer createCustomer(Long ownerId, Customer customer) {
        customer.setOwnerId(ownerId);
        customer.setCustomerCode(generateCustomerCode(ownerId));
        customer.setReferralCode(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        customer.setTiffinsRemaining(customer.getTiffinsTotal());
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer updateCustomer(Long customerId, Long ownerId, Customer updates) {
        Customer existing = getCustomer(customerId, ownerId);
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getPhone() != null) existing.setPhone(updates.getPhone());
        if (updates.getAddress() != null) existing.setAddress(updates.getAddress());
        if (updates.getZone() != null) existing.setZone(updates.getZone());
        if (updates.getPackageId() != null) existing.setPackageId(updates.getPackageId());
        if (updates.getDeliveryBoyId() != null) existing.setDeliveryBoyId(updates.getDeliveryBoyId());
        if (updates.getNotes() != null) existing.setNotes(updates.getNotes());
        if (updates.getSubscriptionStart() != null) existing.setSubscriptionStart(updates.getSubscriptionStart());
        if (updates.getSubscriptionEnd() != null) existing.setSubscriptionEnd(updates.getSubscriptionEnd());
        if (updates.getTiffinsTotal() != null) existing.setTiffinsTotal(updates.getTiffinsTotal());
        return customerRepository.save(existing);
    }

    @Transactional
    public Customer updateStatus(Long customerId, Long ownerId, Customer.Status status) {
        Customer customer = getCustomer(customerId, ownerId);
        customer.setStatus(status);
        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Long customerId, Long ownerId) {
        Customer customer = getCustomer(customerId, ownerId);
        customer.setIsDeleted(true);
        customerRepository.save(customer);
    }

    private String generateCustomerCode(Long ownerId) {
        Integer max = customerRepository.findMaxCustomerCodeNumber(ownerId);
        int next = (max == null ? 0 : max) + 1;
        return String.format("TF-%03d", next);
    }
}
