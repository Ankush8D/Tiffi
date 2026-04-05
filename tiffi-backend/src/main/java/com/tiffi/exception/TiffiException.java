package com.tiffi.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class TiffiException extends RuntimeException {
    private final HttpStatus status;

    public TiffiException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public static TiffiException notFound(String message) {
        return new TiffiException(message, HttpStatus.NOT_FOUND);
    }

    public static TiffiException badRequest(String message) {
        return new TiffiException(message, HttpStatus.BAD_REQUEST);
    }

    public static TiffiException unauthorized(String message) {
        return new TiffiException(message, HttpStatus.UNAUTHORIZED);
    }

    public static TiffiException forbidden(String message) {
        return new TiffiException(message, HttpStatus.FORBIDDEN);
    }
}
