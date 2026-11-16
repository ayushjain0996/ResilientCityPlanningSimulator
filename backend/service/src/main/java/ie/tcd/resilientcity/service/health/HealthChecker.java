package ie.tcd.resilientcity.service.health;

import ie.tcd.resilientcity.domain.HealthStatus;
import ie.tcd.resilientcity.port.in.HealthCheckUseCase;

public final class HealthChecker implements HealthCheckUseCase {

    @Override
    public HealthStatus checkHealth() {
        return HealthStatus.UP;
    }
}
