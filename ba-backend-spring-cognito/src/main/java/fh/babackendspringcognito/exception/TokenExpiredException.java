package fh.babackendspringcognito.exception;

/**
 * Exception for expired JWT tokens.
 */
public class TokenExpiredException extends AuthenticationException {

    public TokenExpiredException(String message) {
        super(message);
    }

    public TokenExpiredException(String message, Throwable cause) {
        super(message, cause);
    }
}

