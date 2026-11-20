package ie.tcd.resilientcity.adapter.inbound.worker;

import static org.mockito.Mockito.verify;

import ie.tcd.resilientcity.adapter.outbound.messaging.RunMessage;
import ie.tcd.resilientcity.domain.QueuedRun;
import ie.tcd.resilientcity.domain.RunId;
import ie.tcd.resilientcity.domain.ScenarioId;
import ie.tcd.resilientcity.domain.Seed;
import ie.tcd.resilientcity.port.in.ExecuteRunUseCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RunWorkerTest {

    @Mock
    private ExecuteRunUseCase executeRunUseCase;

    @Test
    void handsTheRunInAReceivedMessageToTheExecuteRunUseCase() {
        RunWorker worker = new RunWorker(executeRunUseCase);

        worker.onMessage(new RunMessage("77", "5", 99L));

        verify(executeRunUseCase).executeRun(new QueuedRun(new RunId("77"), new ScenarioId("5"), new Seed(99)));
    }
}
