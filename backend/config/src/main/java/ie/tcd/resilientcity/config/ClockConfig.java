package ie.tcd.resilientcity.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Provides the one clock that the whole backend takes the current time from.
 */
@Configuration
public class ClockConfig {

    /**
     * Creates the configuration.
     */
    public ClockConfig() {
    }

    /**
     * Provides the system clock in UTC.
     *
     * @return the clock, never {@code null}
     */
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
