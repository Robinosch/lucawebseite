package fh.babackendspringcognito.exception;

/**
 * Exception for invalid or malformed JWT tokens.
 * Used for hypothesis H5 - Token validation error handling.
 */
public class InvalidTokenException extends AuthenticationException {

    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}

