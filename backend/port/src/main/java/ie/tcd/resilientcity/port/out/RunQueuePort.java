package ie.tcd.resilientcity.port.out;

import ie.tcd.resilientcity.domain.QueuedRun;

/**
 * Puts a run on the run queue so that a worker can take it when it is free. Used by the Simulation
 * Orchestrator when a run is created with status QUEUED, in every use case that starts a simulation.
 */
public interface RunQueuePort {

    /**
     * Adds the run to the queue. The run keeps its seed, so that it can be repeated exactly.
     *
     * @param run the run to queue, never {@code null}
     */
    void enqueueRun(QueuedRun run);
}
