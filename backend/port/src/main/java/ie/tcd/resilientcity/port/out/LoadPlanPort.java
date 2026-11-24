package ie.tcd.resilientcity.port.out;

import java.util.List;
import java.util.Optional;

import ie.tcd.resilientcity.domain.exception.RecordsUnavailableException;
import ie.tcd.resilientcity.domain.plan.Plan;
import ie.tcd.resilientcity.domain.plan.PlanId;

/**
 * Loads plans from Records. Used by the thin slice to prove that the backend can read from Records.
 */
public interface LoadPlanPort {

    /**
     * Loads every stored plan.
     *
     * @return the stored plans, or an empty list if there are none, never {@code null}
     * @throws RecordsUnavailableException if Records cannot be read
     */
    List<Plan> loadAllPlans();

    /**
     * Loads one stored plan.
     *
     * @param planId the ID of the plan to load, never {@code null}
     * @return the plan, or an empty {@code Optional} if no plan has this ID
     * @throws RecordsUnavailableException if Records cannot be read
     */
    Optional<Plan> loadPlan(PlanId planId);
}
