package dev.sift.search.web;

/** A request that fails validation before it ever reaches Serper. */
public class BadRequestException extends RuntimeException {

    private final String hint;

    public BadRequestException(String message, String hint) {
        super(message);
        this.hint = hint;
    }

    public String hint() {
        return hint;
    }
}
