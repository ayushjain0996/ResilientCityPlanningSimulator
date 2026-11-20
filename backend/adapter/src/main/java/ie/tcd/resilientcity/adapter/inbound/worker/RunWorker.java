package ie.tcd.resilientcity.adapter.inbound.worker;

import ie.tcd.resilientcity.adapter.outbound.messaging.RunMessage;
import ie.tcd.resilientcity.domain.QueuedRun;
import ie.tcd.resilientcity.domain.RunId;
import ie.tcd.resilientcity.domain.ScenarioId;
import ie.tcd.resilientcity.domain.Seed;
import ie.tcd.resilientcity.port.in.ExecuteRunUseCase;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Takes run jobs off the run queue and hands each one to the {@link ExecuteRunUseCase}.
 */
@Component
public class RunWorker {

    private final ExecuteRunUseCase executeRunUseCase;

    public RunWorker(ExecuteRunUseCase executeRunUseCase) {
        this.executeRunUseCase = executeRunUseCase;
    }

    @RabbitListener(queues = "${resilientcity.queue.runs}")
    public void onMessage(RunMessage message) {
        QueuedRun run = new QueuedRun(
                new RunId(message.runId()),
                new ScenarioId(message.scenarioId()),
                new Seed(message.seed()));
        executeRunUseCase.executeRun(run);
    }
}
