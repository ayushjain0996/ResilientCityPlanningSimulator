package ie.tcd.resilientcity.service.plan;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import ie.tcd.resilientcity.domain.exception.InvalidPlanNameException;
import ie.tcd.resilientcity.domain.exception.RecordsUnavailableException;
import ie.tcd.resilientcity.domain.plan.Plan;
import ie.tcd.resilientcity.domain.plan.PlanId;
import ie.tcd.resilientcity.port.out.LoadPlanPort;
import ie.tcd.resilientcity.port.out.SavePlanPort;
import org.junit.jupiter.api.Test;

class PlanManagerTest {

    private static final Instant NOW = Instant.parse("2026-01-01T12:00:00Z");
    private static final Plan BASELINE_PLAN = plan("00000000-0000-0000-0000-000000000001", "Baseline");
    private static final Plan GROWTH_PLAN = plan("00000000-0000-0000-0000-000000000002", "Growth");

    private final FakeRecords records = new FakeRecords();
    private final PlanManager planManager = new PlanManager(records, records, Clock.fixed(NOW, ZoneOffset.UTC));

    @Test
    void createsPlanWithGivenNameAndClockTime() {
        Plan created = planManager.createPlan("Dublin Docklands baseline");

        assertThat(created.name()).isEqualTo("Dublin Docklands baseline");
        assertThat(created.createdAt()).isEqualTo(NOW);
    }

    @Test
    void roundsCreationTimeToMicroseconds() {
        Instant nanosecondTime = Instant.parse("2026-01-01T12:00:00.123456789Z");
        PlanManager nanosecondPlanManager =
                new PlanManager(records, records, Clock.fixed(nanosecondTime, ZoneOffset.UTC));

        Plan created = nanosecondPlanManager.createPlan("Plan");

        assertThat(created.createdAt()).isEqualTo(Instant.parse("2026-01-01T12:00:00.123456Z"));
    }

    @Test
    void savesTheCreatedPlan() {
        Plan created = planManager.createPlan("Dublin Docklands baseline");

        assertThat(records.plans).containsExactly(created);
    }

    @Test
    void givesEveryPlanItsOwnId() {
        Plan first = planManager.createPlan("Same name");
        Plan second = planManager.createPlan("Same name");

        assertThat(first.id()).isNotEqualTo(second.id());
    }

    @Test
    void savesNothingWhenNameIsInvalid() {
        assertThatThrownBy(() -> planManager.createPlan(" "))
                .isInstanceOf(InvalidPlanNameException.class);

        assertThat(records.plans).isEmpty();
    }

    @Test
    void passesOnTheFailureWhenRecordsAreUnavailable() {
        RecordsUnavailableException failure = new RecordsUnavailableException("Saving failed", new RuntimeException());
        SavePlanPort failingSavePlanPort = plan -> {
            throw failure;
        };
        PlanManager failingPlanManager =
                new PlanManager(failingSavePlanPort, records, Clock.fixed(NOW, ZoneOffset.UTC));

        assertThatThrownBy(() -> failingPlanManager.createPlan("Plan")).isSameAs(failure);
    }

    @Test
    void loadsAllStoredPlans() {
        records.plans.addAll(List.of(BASELINE_PLAN, GROWTH_PLAN));

        assertThat(planManager.loadAllPlans()).containsExactly(BASELINE_PLAN, GROWTH_PLAN);
    }

    @Test
    void loadsNoPlansWhenNoneAreStored() {
        assertThat(planManager.loadAllPlans()).isEmpty();
    }

    @Test
    void loadsThePlanWithTheGivenId() {
        records.plans.addAll(List.of(BASELINE_PLAN, GROWTH_PLAN));

        assertThat(planManager.loadPlan(GROWTH_PLAN.id())).contains(GROWTH_PLAN);
    }

    @Test
    void loadsNothingWhenNoPlanHasTheGivenId() {
        records.plans.add(BASELINE_PLAN);

        assertThat(planManager.loadPlan(GROWTH_PLAN.id())).isEmpty();
    }

    private static Plan plan(String id, String name) {
        return new Plan(new PlanId(UUID.fromString(id)), name, NOW);
    }

    private static final class FakeRecords implements SavePlanPort, LoadPlanPort {

        private final List<Plan> plans = new ArrayList<>();

        @Override
        public void savePlan(Plan plan) {
            plans.add(plan);
        }

        @Override
        public List<Plan> loadAllPlans() {
            return List.copyOf(plans);
        }

        @Override
        public Optional<Plan> loadPlan(PlanId planId) {
            return plans.stream()
                    .filter(plan -> plan.id().equals(planId))
                    .findFirst();
        }
    }
}
