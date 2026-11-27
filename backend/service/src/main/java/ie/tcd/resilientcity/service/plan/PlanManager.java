package ie.tcd.resilientcity.service.plan;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import ie.tcd.resilientcity.domain.exception.InvalidPlanNameException;
import ie.tcd.resilientcity.domain.exception.RecordsUnavailableException;
import ie.tcd.resilientcity.domain.plan.Plan;
import ie.tcd.resilientcity.domain.plan.PlanId;
import ie.tcd.resilientcity.port.in.CreatePlanUseCase;
import ie.tcd.resilientcity.port.in.LoadPlansUseCase;
import ie.tcd.resilientcity.port.out.LoadPlanPort;
import ie.tcd.resilientcity.port.out.SavePlanPort;

/**
 * The Plan Manager. Creates plans and loads stored ones, reaching Records only through its output ports.
 */
public final class PlanManager implements CreatePlanUseCase, LoadPlansUseCase {

    private final SavePlanPort savePlanPort;
    private final LoadPlanPort loadPlanPort;
    private final Clock clock;

    /**
     * Creates the Plan Manager.
     *
     * @param savePlanPort stores plans in Records
     * @param loadPlanPort loads plans from Records
     * @param clock gives each new plan its creation time
     */
    public PlanManager(SavePlanPort savePlanPort, LoadPlanPort loadPlanPort, Clock clock) {
        this.savePlanPort = savePlanPort;
        this.loadPlanPort = loadPlanPort;
        this.clock = clock;
    }

    /**
     * Creates a plan with a new random ID and the current time, and stores it in Records. Nothing is stored if
     * the name is invalid. The time is rounded down to microseconds, the precision Records keeps, so the returned
     * plan matches the stored one on every system clock.
     *
     * @param name the plan's name, not blank and at most {@link Plan#MAX_NAME_LENGTH} characters
     * @return the stored plan, never {@code null}
     * @throws InvalidPlanNameException if {@code name} is {@code null}, blank or too long
     * @throws RecordsUnavailableException if Records cannot be written
     */
    @Override
    public Plan createPlan(String name) {
        Instant createdAt = Instant.now(clock).truncatedTo(ChronoUnit.MICROS);
        Plan plan = new Plan(new PlanId(UUID.randomUUID()), name, createdAt);
        savePlanPort.savePlan(plan);
        return plan;
    }

    /**
     * Loads every plan stored in Records, oldest first. Plans created at the same time are ordered by ID.
     *
     * @return the stored plans, or an empty list if there are none, never {@code null}
     * @throws RecordsUnavailableException if Records cannot be read
     */
    @Override
    public List<Plan> loadAllPlans() {
        return loadPlanPort.loadAllPlans();
    }

    /**
     * Loads one plan from Records.
     *
     * @param planId the ID of the plan to load, never {@code null}
     * @return the plan, or an empty {@code Optional} if no plan has this ID
     * @throws RecordsUnavailableException if Records cannot be read
     */
    @Override
    public Optional<Plan> loadPlan(PlanId planId) {
        return loadPlanPort.loadPlan(planId);
    }
}
