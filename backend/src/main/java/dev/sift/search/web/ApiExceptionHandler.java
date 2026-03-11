package dev.sift.search.web;

import dev.sift.search.client.SerperException;
import dev.sift.search.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> handleBadRequest(BadRequestException e) {
        return build(HttpStatus.BAD_REQUEST, e.getMessage(), e.hint());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException e) {
        return build(HttpStatus.BAD_REQUEST, "Enter something to search for.", null);
    }

    @ExceptionHandler(SerperException.class)
    public ResponseEntity<ApiError> handleSerper(SerperException e) {
        return switch (e.kind()) {
            case AUTH -> build(HttpStatus.BAD_GATEWAY,
                "Sift can't reach the search index.",
                "The SERPER_API_KEY on the server is missing or invalid.");
            case RATE_LIMIT -> build(HttpStatus.BAD_GATEWAY,
                "Sift is out of search credits for now.",
                "Try again later, or top up the Serper account.");
            case TIMEOUT -> build(HttpStatus.GATEWAY_TIMEOUT,
                "The search took too long to come back.",
                "Try that query again.");
            case IO, UNKNOWN -> build(HttpStatus.GATEWAY_TIMEOUT,
                "The search took too long to come back.",
                "Try that query again.");
        };
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception e) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR,
            "Sift hit a snag handling that search.",
            "Try that query again.");
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message, String hint) {
        return ResponseEntity.status(status).body(new ApiError(message, hint, status.value()));
    }
}
