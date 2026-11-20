package ie.tcd.resilientcity.domain.exception;

public class InvalidSeedException extends RuntimeException {

    public InvalidSeedException(long value) {
        super("A seed must not be negative, but was " + value);
    }
}
