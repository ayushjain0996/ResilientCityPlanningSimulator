package ie.tcd.resilientcity.service.health;

import static org.assertj.core.api.Assertions.assertThat;

import ie.tcd.resilientcity.domain.HealthStatus;
import org.junit.jupiter.api.Test;

class HealthCheckerTest {

    @Test
    void reportsUpWhenChecked() {
        HealthChecker healthChecker = new HealthChecker();

        assertThat(healthChecker.checkHealth()).isEqualTo(HealthStatus.UP);
    }
}
