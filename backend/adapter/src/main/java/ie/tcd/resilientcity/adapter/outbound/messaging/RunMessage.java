package ie.tcd.resilientcity.adapter.outbound.messaging;

public record RunMessage(String runId, String scenarioId, long seed) {
}
