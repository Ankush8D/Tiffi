package com.tiffi.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.tiffi.entity.Customer;
import com.tiffi.entity.Payment;
import com.tiffi.exception.TiffiException;
import com.tiffi.repository.CustomerRepository;
import com.tiffi.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Transactional
    public Payment recordCash(Long customerId, Long ownerId, BigDecimal amount, String notes) {
        Payment payment = Payment.builder()
                .customerId(customerId)
                .ownerId(ownerId)
                .amount(amount)
                .paymentMode(Payment.PaymentMode.cash)
                .status(Payment.Status.paid)
                .paymentDate(LocalDate.now())
                .notes(notes)
                .build();
        return paymentRepository.save(payment);
    }

    public Map<String, Object> createRazorpayOrder(Long customerId, Long ownerId, BigDecimal amount) {
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount.multiply(BigDecimal.valueOf(100)).intValue()); // paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "tiffi_" + customerId + "_" + System.currentTimeMillis());

            Order order = client.orders.create(orderRequest);

            // Save pending payment
            Payment payment = Payment.builder()
                    .customerId(customerId)
                    .ownerId(ownerId)
                    .amount(amount)
                    .paymentMode(Payment.PaymentMode.online)
                    .razorpayOrderId(order.get("id"))
                    .status(Payment.Status.pending)
                    .build();
            paymentRepository.save(payment);

            return Map.of(
                    "orderId", order.get("id").toString(),
                    "amount", amount,
                    "currency", "INR",
                    "keyId", razorpayKeyId
            );
        } catch (Exception e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw TiffiException.badRequest("Payment order creation failed: " + e.getMessage());
        }
    }

    @Transactional
    public Payment verifyRazorpayPayment(String orderId, String paymentId) {
        Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> TiffiException.notFound("Payment order not found"));
        payment.setRazorpayPaymentId(paymentId);
        payment.setStatus(Payment.Status.paid);
        payment.setPaymentDate(LocalDate.now());
        return paymentRepository.save(payment);
    }

    public List<Payment> getHistory(Long customerId) {
        return paymentRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<Map<String, Object>> getMonthlyPayments(Long ownerId, int month, int year) {
        List<Payment> payments = paymentRepository.findByOwnerIdAndMonth(ownerId, month, year);
        List<Long> customerIds = payments.stream().map(Payment::getCustomerId).distinct().collect(Collectors.toList());
        Map<Long, String> nameMap = new HashMap<>();
        customerRepository.findAllById(customerIds).forEach(c -> nameMap.put(c.getId(), c.getName()));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Payment p : payments) {
            Map<String, Object> row = new HashMap<>();
            row.put("id", p.getId());
            row.put("customerId", p.getCustomerId());
            row.put("customerName", nameMap.getOrDefault(p.getCustomerId(), "Unknown"));
            row.put("amount", p.getAmount());
            row.put("paymentMode", p.getPaymentMode());
            row.put("status", p.getStatus());
            row.put("paymentDate", p.getPaymentDate());
            row.put("notes", p.getNotes());
            result.add(row);
        }
        return result;
    }

    public Map<String, Object> getMonthlySummary(Long ownerId, int month, int year) {
        BigDecimal collected = paymentRepository.sumCollectedByOwnerAndMonth(ownerId, month, year);
        long pending = paymentRepository.countByOwnerIdAndStatus(ownerId, Payment.Status.pending);
        return Map.of(
                "collected", collected != null ? collected : BigDecimal.ZERO,
                "pendingCount", pending
        );
    }

    public String generateWhatsAppReminder(String customerName, BigDecimal amount, String upiId, String customerPhone) {
        String message = String.format(
                "Namaste %s! Aapka tiffin ka payment Rs.%s baaki hai. Kindly UPI pe transfer karein: %s. Shukriya!",
                customerName, amount.toPlainString(), upiId
        );
        return "https://wa.me/91" + customerPhone + "?text=" + message.replace(" ", "%20");
    }
}
