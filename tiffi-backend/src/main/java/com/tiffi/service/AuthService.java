package com.tiffi.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.tiffi.dto.request.VerifyTokenRequest;
import com.tiffi.dto.response.AuthResponse;
import com.tiffi.entity.Owner;
import com.tiffi.entity.Customer;
import com.tiffi.exception.TiffiException;
import com.tiffi.repository.OwnerRepository;
import com.tiffi.repository.CustomerRepository;
import com.tiffi.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final OwnerRepository ownerRepository;
    private final CustomerRepository customerRepository;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse verifyFirebaseToken(VerifyTokenRequest request) {
        try {
            FirebaseToken firebaseToken = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken());
            String phone = firebaseToken.getClaims().getOrDefault("phone_number", "").toString();

            if (phone.isEmpty()) {
                throw TiffiException.badRequest("Phone number not found in Firebase token");
            }

            // Normalize phone: remove +91 prefix
            if (phone.startsWith("+91")) {
                phone = phone.substring(3);
            }

            return switch (request.getRole()) {
                case "OWNER" -> handleOwnerAuth(phone);
                case "CUSTOMER" -> handleCustomerAuth(phone);
                case "DELIVERY_BOY" -> handleDeliveryBoyAuth(phone);
                default -> throw TiffiException.badRequest("Invalid role");
            };

        } catch (TiffiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Firebase token verification failed: {}", e.getMessage());
            throw TiffiException.unauthorized("Invalid or expired Firebase token");
        }
    }

    private AuthResponse handleOwnerAuth(String phone) {
        boolean isNew = !ownerRepository.existsByPhone(phone);
        Owner owner = ownerRepository.findByPhone(phone).orElseGet(() -> {
            Owner newOwner = Owner.builder()
                    .name("Owner")
                    .phone(phone)
                    .businessName("My Tiffin Center")
                    .workingDaysPerMonth(26)
                    .build();
            return ownerRepository.save(newOwner);
        });

        return AuthResponse.builder()
                .userId(owner.getId())
                .phone(owner.getPhone())
                .role("OWNER")
                .accessToken(jwtUtil.generateToken(owner.getId(), owner.getPhone(), "OWNER"))
                .refreshToken(jwtUtil.generateRefreshToken(owner.getId()))
                .isNewUser(isNew)
                .build();
    }

    private AuthResponse handleCustomerAuth(String phone) {
        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> TiffiException.notFound("No customer account found for this number. Ask your tiffin center owner to register you."));

        return AuthResponse.builder()
                .userId(customer.getId())
                .phone(customer.getPhone())
                .role("CUSTOMER")
                .accessToken(jwtUtil.generateToken(customer.getId(), customer.getPhone(), "CUSTOMER"))
                .refreshToken(jwtUtil.generateRefreshToken(customer.getId()))
                .isNewUser(false)
                .build();
    }

    private AuthResponse handleDeliveryBoyAuth(String phone) {
        // Delivery boy auth will be implemented in delivery boy management
        throw TiffiException.badRequest("Delivery boy login coming soon");
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtil.isTokenValid(refreshToken)) {
            throw TiffiException.unauthorized("Invalid or expired refresh token");
        }
        Long userId = jwtUtil.getUserId(refreshToken);
        String role = jwtUtil.getRole(refreshToken);

        // Role will be null on refresh token — look up from DB
        Owner owner = ownerRepository.findById(userId).orElse(null);
        if (owner != null) {
            return AuthResponse.builder()
                    .userId(owner.getId())
                    .phone(owner.getPhone())
                    .role("OWNER")
                    .accessToken(jwtUtil.generateToken(owner.getId(), owner.getPhone(), "OWNER"))
                    .refreshToken(jwtUtil.generateRefreshToken(owner.getId()))
                    .isNewUser(false)
                    .build();
        }

        throw TiffiException.unauthorized("User not found");
    }
}
