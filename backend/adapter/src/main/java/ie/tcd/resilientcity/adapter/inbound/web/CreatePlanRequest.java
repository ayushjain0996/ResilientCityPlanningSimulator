package ie.tcd.resilientcity.adapter.inbound.web;

/**
 * The request body for creating a plan.
 *
 * @param name the plan's name
 */
public record CreatePlanRequest(String name) {
}
