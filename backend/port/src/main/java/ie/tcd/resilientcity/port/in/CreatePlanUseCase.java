package ie.tcd.resilientcity.port.in;

import ie.tcd.resilientcity.domain.exception.InvalidPlanNameException;
import ie.tcd.resilientcity.domain.exception.RecordsUnavailableException;
import ie.tcd.resilientcity.domain.plan.Plan;

/**
 * Creates plans. Used by the thin slice to prove that the backend can write to Records.
 */
public interface CreatePlanUseCase {

    /**
     * Creates a plan with the given name and stores it in Records.
     *
     * @param name the plan's name, not blank and at most {@link Plan#MAX_NAME_LENGTH} characters
     * @return the stored plan, with its new ID and creation time, never {@code null}
     * @throws InvalidPlanNameException if {@code name} is {@code null}, blank or too long
     * @throws RecordsUnavailableException if Records cannot be written
     */
    Plan createPlan(String name);
}
