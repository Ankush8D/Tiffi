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
        } catch (IOException e) {
            log.warn("Firebase service account not found — Firebase auth will not work until configured");
        }
    }

    private InputStream loadCredentials() throws IOException {
        // Production: read from base64-encoded env var FIREBASE_CREDENTIALS_BASE64
        String base64 = System.getenv("FIREBASE_CREDENTIALS_BASE64");
        if (base64 != null && !base64.isBlank()) {
            log.info("Loading Firebase credentials from environment variable");
            byte[] decoded = Base64.getMimeDecoder().decode(base64);
            return new ByteArrayInputStream(decoded);
        }
        // Local dev: read from classpath file
        log.info("Loading Firebase credentials from classpath file");
        return new ClassPathResource("firebase-service-account.json").getInputStream();
    }
}
