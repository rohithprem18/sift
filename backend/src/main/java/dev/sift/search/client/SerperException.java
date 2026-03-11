package dev.sift.search.client;

/**
 * Thrown when the Serper API can't be reached or refuses the request.
 * {@code kind} tells the caller which flavour of failure it was, so it can
 * be mapped to the right HTTP status and copy further up the stack.
 */
public class SerperException extends RuntimeException {

    public enum Kind { AUTH, RATE_LIMIT, TIMEOUT, IO, UNKNOWN }

    private final Kind kind;

    public SerperException(Kind kind, String message, Throwable cause) {
        super(message, cause);
        this.kind = kind;
    }

    public SerperException(Kind kind, String message) {
        super(message);
        this.kind = kind;
    }

    public Kind kind() {
        return kind;
    }
}
