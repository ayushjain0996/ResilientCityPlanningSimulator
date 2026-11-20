package ie.tcd.resilientcity.port.in;

import ie.tcd.resilientcity.domain.QueuedRun;

/**
 * Executes one queued simulation run. Used by the run worker when it takes the next job off
 * the run queue.
 */
public interface ExecuteRunUseCase {

    /**
     * Executes the given run.
     *
     * @param run the run taken from the queue, never {@code null}
     */
    void executeRun(QueuedRun run);
}
