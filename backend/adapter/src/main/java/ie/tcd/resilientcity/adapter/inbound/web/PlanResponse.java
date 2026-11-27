package ie.tcd.resilientcity.adapter.inbound.web;

import java.time.Instant;

import ie.tcd.resilientcity.domain.plan.Plan;

/**
 * A plan, as returned to the UI.
 *
 * @param id the plan's identifier
 * @param name the plan's name
 * @param createdAt when the plan was created
 */
public record PlanResponse(String id, String name, Instant createdAt) {

    /**
     * Converts a domain plan to a response.
     *
     * @param plan the plan to convert, never {@code null}
     * @return the response, never {@code null}
     */
    static PlanResponse from(Plan plan) {
        return new PlanResponse(plan.id().value().toString(), plan.name(), plan.createdAt());
    }
}
