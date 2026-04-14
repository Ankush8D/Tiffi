package com.tiffi.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import jakarta.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

@Configuration
@Slf4j
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = loadCredentials();
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
                FirebaseApp.initializeApp(options);
                log.info("Firebase initialized successfully");
            }
        } catch (Exception e) {
            log.warn("Firebase initialization failed — phone auth will not work: {}", e.getMessage());
        }
    }

    private InputStream loadCredentials() throws IOException {
        String base64 = System.getenv("FIREBASE_CREDENTIALS_BASE64");
        if (base64 != null && !base64.isBlank()) {
            log.info("Loading Firebase credentials from environment variable");
            // Strip all whitespace before decoding
            byte[] decoded = Base64.getDecoder().decode(base64.replaceAll("\\s+", ""));
            return new ByteArrayInputStream(decoded);
        }
        log.info("Loading Firebase credentials from classpath file");
        return new ClassPathResource("firebase-service-account.json").getInputStream();
    }
}
