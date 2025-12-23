package fh.babackendspringcognito.exception;

/**
 * Exception for registration failures.
 * Used for hypothesis H6 - Registration flow error handling.
 */
public class RegistrationException extends RuntimeException {

    public RegistrationException(String message) {
        super(message);
    }

    public RegistrationException(String message, Throwable cause) {
        super(message, cause);
    }
}

