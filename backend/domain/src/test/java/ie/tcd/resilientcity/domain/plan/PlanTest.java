package ie.tcd.resilientcity.domain.plan;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.UUID;

import ie.tcd.resilientcity.domain.exception.InvalidPlanNameException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class PlanTest {

    private static final PlanId PLAN_ID = new PlanId(UUID.fromString("00000000-0000-0000-0000-000000000001"));
    private static final Instant CREATED_AT = Instant.parse("2026-01-01T00:00:00Z");

    @Test
    void keepsValidValues() {
        Plan plan = new Plan(PLAN_ID, "Dublin Docklands baseline", CREATED_AT);

        assertThat(plan.id()).isEqualTo(PLAN_ID);
        assertThat(plan.name()).isEqualTo("Dublin Docklands baseline");
        assertThat(plan.createdAt()).isEqualTo(CREATED_AT);
    }

    @Test
    void rejectsNullId() {
        assertThatNullPointerException().isThrownBy(() -> new Plan(null, "Plan", CREATED_AT));
    }

    @Test
    void rejectsNullCreatedAt() {
        assertThatNullPointerException().isThrownBy(() -> new Plan(PLAN_ID, "Plan", null));
    }

    @Test
    void rejectsNullName() {
        assertThatThrownBy(() -> new Plan(PLAN_ID, null, CREATED_AT))
                .isInstanceOf(InvalidPlanNameException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"", " ", "\t\n"})
    void rejectsBlankName(String name) {
        assertThatThrownBy(() -> new Plan(PLAN_ID, name, CREATED_AT))
                .isInstanceOf(InvalidPlanNameException.class);
    }

    @Test
    void acceptsNameAtMaximumLength() {
        String name = "a".repeat(Plan.MAX_NAME_LENGTH);

        assertThat(new Plan(PLAN_ID, name, CREATED_AT).name()).hasSize(Plan.MAX_NAME_LENGTH);
    }

    @Test
    void leavesRejectedNameOutOfTheMessage() {
        String name = "<script>" + "a".repeat(Plan.MAX_NAME_LENGTH);

        assertThatThrownBy(() -> new Plan(PLAN_ID, name, CREATED_AT))
                .isInstanceOf(InvalidPlanNameException.class)
                .hasMessageNotContaining("<script>")
                .hasMessageContaining((Plan.MAX_NAME_LENGTH + 8) + " characters long");
    }

    @Test
    void reportsMissingName() {
        assertThatThrownBy(() -> new Plan(PLAN_ID, null, CREATED_AT))
                .hasMessageEndingWith("but it was missing");
    }

    @Test
    void reportsBlankName() {
        assertThatThrownBy(() -> new Plan(PLAN_ID, " ", CREATED_AT))
                .hasMessageEndingWith("but it was blank");
    }

    @Test
    void rejectsNameLongerThanMaximumLength() {
        String name = "a".repeat(Plan.MAX_NAME_LENGTH + 1);

        assertThatThrownBy(() -> new Plan(PLAN_ID, name, CREATED_AT))
                .isInstanceOf(InvalidPlanNameException.class);
    }
}
