package fh.babackendspringcognito.exception;

/**
 * Base exception for authentication failures.
 * Used for hypothesis H5 - Token validation error handling.
 */
public class AuthenticationException extends RuntimeException {

    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}

