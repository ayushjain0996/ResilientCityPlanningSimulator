package ie.tcd.resilientcity.domain.exception;

/**
 * Thrown when a plan name is missing, blank or too long.
 */
public class InvalidPlanNameException extends RuntimeException {

    /**
     * Creates the exception with a message that states the rule and the rejected name.
     *
     * @param name the rejected name, which may be {@code null}
     * @param maxLength the longest name allowed, in characters
     */
    public InvalidPlanNameException(String name, int maxLength) {
        super("Plan name must be non-blank and at most " + maxLength + " characters, but was: " + name);
    }
}
