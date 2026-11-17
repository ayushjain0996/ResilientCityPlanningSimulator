package ie.tcd.resilientcity.adapter.inbound.web;

import ie.tcd.resilientcity.port.in.HealthCheckUseCase;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final HealthCheckUseCase healthCheckUseCase;

    public HealthController(HealthCheckUseCase healthCheckUseCase) {
        this.healthCheckUseCase = healthCheckUseCase;
    }

    @GetMapping("/api/health")
    public HealthResponse health() {
        return new HealthResponse(healthCheckUseCase.checkHealth().name());
    }
}
