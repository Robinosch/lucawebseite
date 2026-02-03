package fh.babackendspringcognito.exception;

/**
 * Exception for invalid or malformed JWT tokens.
 */
public class InvalidTokenException extends AuthenticationException {

    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}

