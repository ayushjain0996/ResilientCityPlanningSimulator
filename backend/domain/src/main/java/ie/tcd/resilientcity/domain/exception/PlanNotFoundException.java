package ie.tcd.resilientcity.domain.exception;

import ie.tcd.resilientcity.domain.plan.PlanId;

/**
 * Thrown when no plan exists with the requested ID.
 */
public class PlanNotFoundException extends RuntimeException {

    /**
     * Creates the exception with a message that names the missing plan.
     *
     * @param planId the ID that was not found, never {@code null}
     */
    public PlanNotFoundException(PlanId planId) {
        super("No plan found with id " + planId.value());
    }
}
