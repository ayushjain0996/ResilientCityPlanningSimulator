package ie.tcd.resilientcity.config;

import ie.tcd.resilientcity.port.in.ExecuteRunUseCase;
import ie.tcd.resilientcity.port.in.HealthCheckUseCase;
import ie.tcd.resilientcity.service.health.HealthChecker;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UseCaseConfig {

    private static final System.Logger LOGGER = System.getLogger(UseCaseConfig.class.getName());

    @Bean
    public HealthCheckUseCase healthCheckUseCase() {
        return new HealthChecker();
    }

    /**
     * TEMPORARY stand-in so the run queue can be checked end to end. Replace it with the real
     * implementation once the simulator is connected.
     */
    @Bean
    public ExecuteRunUseCase executeRunUseCase() {
        return run -> LOGGER.log(System.Logger.Level.INFO, "Executing {0}", run);
    }
}
