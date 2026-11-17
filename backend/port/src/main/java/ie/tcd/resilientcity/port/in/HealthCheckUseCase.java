package ie.tcd.resilientcity.port.in;

import ie.tcd.resilientcity.domain.HealthStatus;

/**
 * Reports whether the backend is running. Used by the thin slice to prove that the React UI
 * can reach the backend through {@code /api}.
 */
public interface HealthCheckUseCase {

    /**
     * Returns the current status of the backend.
     *
     * @return the health status, never {@code null}
     */
    HealthStatus checkHealth();
}
