package ie.tcd.resilientcity.domain.exception;

/**
 * Thrown when a plan name is missing, blank or too long.
 */
public class InvalidPlanNameException extends RuntimeException {

    /**
     * Creates the exception with a message that states the rule and what was wrong with the name. The message
     * leaves the name itself out, because it reaches API responses and could be long or unsafe to show.
     *
     * @param name the rejected name, which may be {@code null}
     * @param maxLength the longest name allowed, in characters
     */
    public InvalidPlanNameException(String name, int maxLength) {
        super("Plan name must be non-blank and at most " + maxLength + " characters, but it " + describe(name));
    }

    private static String describe(String name) {
        if (name == null) {
            return "was missing";
        }
        if (name.isBlank()) {
            return "was blank";
        }
        return "was " + name.length() + " characters long";
    }
}
