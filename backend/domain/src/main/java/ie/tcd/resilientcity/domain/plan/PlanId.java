package ie.tcd.resilientcity.domain.plan;

import java.util.Objects;
import java.util.UUID;

/**
 * Identifies a {@link Plan}.
 *
 * @param value the unique identifier, never {@code null}
 */
public record PlanId(UUID value) {

    /**
     * Creates a plan ID.
     *
     * @throws NullPointerException if {@code value} is {@code null}
     */
    public PlanId {
        Objects.requireNonNull(value, "value");
    }
}
