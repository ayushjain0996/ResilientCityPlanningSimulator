package ie.tcd.resilientcity.adapter.outbound.persistence;

import java.util.List;
import java.util.Optional;

import ie.tcd.resilientcity.domain.exception.RecordsUnavailableException;
import ie.tcd.resilientcity.domain.plan.Plan;
import ie.tcd.resilientcity.domain.plan.PlanId;
import ie.tcd.resilientcity.port.out.LoadPlanPort;
import ie.tcd.resilientcity.port.out.SavePlanPort;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionException;

/**
 * Stores plans in Records and loads them again, converting between domain plans and JPA entities.
 *
 * <p>Every method also catches {@link TransactionException}, because that is what Spring throws when the database
 * cannot be reached. It is not a {@link DataAccessException}.
 */
@Component
public class PlanPersistenceAdapter implements SavePlanPort, LoadPlanPort {

    private final PlanJpaRepository planJpaRepository;

    /**
     * Creates the adapter.
     *
     * @param planJpaRepository reads and writes rows of the plans table
     */
    PlanPersistenceAdapter(PlanJpaRepository planJpaRepository) {
        this.planJpaRepository = planJpaRepository;
    }

    /**
     * Stores the given plan in the plans table.
     *
     * @param plan the plan to store, never {@code null}
     * @throws RecordsUnavailableException if the database cannot be written
     */
    @Override
    public void savePlan(Plan plan) {
        try {
            planJpaRepository.save(toEntity(plan));
        } catch (DataAccessException | TransactionException exception) {
            throw new RecordsUnavailableException("Could not save plan " + plan.id().value(), exception);
        }
    }

    /**
     * Loads every plan in the plans table.
     *
     * @return the stored plans, or an empty list if there are none, never {@code null}
     * @throws RecordsUnavailableException if the database cannot be read
     */
    @Override
    public List<Plan> loadAllPlans() {
        try {
            return planJpaRepository.findAll().stream()
                    .map(PlanPersistenceAdapter::toPlan)
                    .toList();
        } catch (DataAccessException | TransactionException exception) {
            throw new RecordsUnavailableException("Could not load plans", exception);
        }
    }

    /**
     * Loads one plan from the plans table.
     *
     * @param planId the ID of the plan to load, never {@code null}
     * @return the plan, or an empty {@code Optional} if no plan has this ID
     * @throws RecordsUnavailableException if the database cannot be read
     */
    @Override
    public Optional<Plan> loadPlan(PlanId planId) {
        try {
            return planJpaRepository.findById(planId.value())
                    .map(PlanPersistenceAdapter::toPlan);
        } catch (DataAccessException | TransactionException exception) {
            throw new RecordsUnavailableException("Could not load plan " + planId.value(), exception);
        }
    }

    private static PlanEntity toEntity(Plan plan) {
        return new PlanEntity(plan.id().value(), plan.name(), plan.createdAt());
    }

    private static Plan toPlan(PlanEntity entity) {
        return new Plan(new PlanId(entity.getId()), entity.getName(), entity.getCreatedAt());
    }
}
