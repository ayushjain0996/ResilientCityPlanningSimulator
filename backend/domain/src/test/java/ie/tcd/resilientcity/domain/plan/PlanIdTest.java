package ie.tcd.resilientcity.domain.plan;

import static org.assertj.core.api.Assertions.assertThatNullPointerException;

import org.junit.jupiter.api.Test;

class PlanIdTest {

    @Test
    void rejectsNullValue() {
        assertThatNullPointerException().isThrownBy(() -> new PlanId(null));
    }
}
