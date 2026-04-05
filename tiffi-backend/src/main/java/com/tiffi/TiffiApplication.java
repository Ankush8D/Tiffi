package com.tiffi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TiffiApplication {
    public static void main(String[] args) {
        SpringApplication.run(TiffiApplication.class, args);
    }
}
