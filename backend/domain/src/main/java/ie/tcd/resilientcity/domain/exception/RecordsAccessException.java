package ie.tcd.resilientcity.domain.exception;

/**
 * Thrown when Records cannot be read or written, for example because the database is unreachable.
 */
public class RecordsAccessException extends RuntimeException {

    /**
     * Creates the exception.
     *
     * @param message what Records was doing when it failed
     * @param cause the technology-specific exception that caused the failure
     */
    public RecordsAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}
