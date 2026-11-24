package ie.tcd.resilientcity.port.out;

import ie.tcd.resilientcity.domain.exception.RecordsUnavailableException;
import ie.tcd.resilientcity.domain.plan.Plan;

/**
 * Stores plans in Records. Used by the thin slice to prove that the backend can write to Records.
 */
public interface SavePlanPort {

    /**
     * Stores the given plan.
     *
     * @param plan the plan to store, never {@code null}
     * @throws RecordsUnavailableException if Records cannot be written
     */
    void savePlan(Plan plan);
}
