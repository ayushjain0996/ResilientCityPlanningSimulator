package ie.tcd.resilientcity.domain.exception;

/**
 * Thrown when Records cannot be read or written. Adapters wrap the technology-specific failure in this
 * exception, so that it never reaches the services.
 */
public class RecordsUnavailableException extends RuntimeException {

    /**
     * Creates the exception.
     *
     * @param message what the backend was doing when Records failed
     * @param cause the original failure
     */
    public RecordsUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
