package ie.tcd.resilientcity.config;

import ie.tcd.resilientcity.port.in.HealthCheckUseCase;
import ie.tcd.resilientcity.service.health.HealthChecker;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UseCaseConfig {

    @Bean
    public HealthCheckUseCase healthCheckUseCase() {
        return new HealthChecker();
    }
}
