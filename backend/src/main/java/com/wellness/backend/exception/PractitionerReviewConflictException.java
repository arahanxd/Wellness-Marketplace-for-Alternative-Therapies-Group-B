package com.wellness.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class PractitionerReviewConflictException extends RuntimeException {
    public PractitionerReviewConflictException(String message) {
        super(message);
    }
}
