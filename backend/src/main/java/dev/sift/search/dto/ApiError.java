package dev.sift.search.dto;

public record ApiError(String message, String hint, int status) {}
