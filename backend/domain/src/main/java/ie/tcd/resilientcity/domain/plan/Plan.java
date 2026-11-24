package ie.tcd.resilientcity.domain.plan;

import java.time.Instant;
import java.util.Objects;

import ie.tcd.resilientcity.domain.exception.InvalidPlanNameException;

/**
 * A city plan.
 *
 * @param id the plan's identifier, never {@code null}
 * @param name the plan's name, never blank and at most {@link #MAX_NAME_LENGTH} characters
 * @param createdAt when the plan was created, never {@code null}
 */
public record Plan(PlanId id, String name, Instant createdAt) {

    /**
     * The longest plan name allowed, in characters. Matches the length of the name column in the plans table.
     */
    public static final int MAX_NAME_LENGTH = 200;

    /**
     * Creates a plan.
     *
     * @throws NullPointerException if {@code id} or {@code createdAt} is {@code null}
     * @throws InvalidPlanNameException if {@code name} is {@code null}, blank or longer than
     *         {@link #MAX_NAME_LENGTH} characters
     */
    public Plan {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(createdAt, "createdAt");
        if (name == null || name.isBlank() || name.length() > MAX_NAME_LENGTH) {
            throw new InvalidPlanNameException(name, MAX_NAME_LENGTH);
        }
    }
}
