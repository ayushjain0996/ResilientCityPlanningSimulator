package ie.tcd.resilientcity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the backend service of the Resilient City Planning Simulator.
 *
 * <p>Lives in the root package so component scanning picks up the adapters
 * ({@code ie.tcd.resilientcity.adapter.*}) and the config package.
 */
@SpringBootApplication
public class ResilientCityPlanningSimulatorApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResilientCityPlanningSimulatorApplication.class, args);
    }
}
