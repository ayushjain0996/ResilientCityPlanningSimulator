package ie.tcd.resilientcity.config;

import java.time.Clock;

import ie.tcd.resilientcity.port.in.HealthCheckUseCase;
import ie.tcd.resilientcity.port.out.LoadPlanPort;
import ie.tcd.resilientcity.port.out.SavePlanPort;
import ie.tcd.resilientcity.service.health.HealthChecker;
import ie.tcd.resilientcity.service.plan.PlanManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UseCaseConfig {

    @Bean
    public HealthCheckUseCase healthCheckUseCase() {
        return new HealthChecker();
    }

    /**
     * Registers the Plan Manager, which implements both plan input ports.
     *
     * @param savePlanPort stores plans in Records
     * @param loadPlanPort loads plans from Records
     * @param clock gives each new plan its creation time
     * @return the Plan Manager, never {@code null}
     */
    @Bean
    public PlanManager planManager(SavePlanPort savePlanPort, LoadPlanPort loadPlanPort, Clock clock) {
        return new PlanManager(savePlanPort, loadPlanPort, clock);
    }
}
