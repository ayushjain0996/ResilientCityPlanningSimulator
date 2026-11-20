package ie.tcd.resilientcity.adapter.outbound.messaging;

import static org.mockito.Mockito.verify;

import ie.tcd.resilientcity.domain.QueuedRun;
import ie.tcd.resilientcity.domain.RunId;
import ie.tcd.resilientcity.domain.ScenarioId;
import ie.tcd.resilientcity.domain.Seed;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

@ExtendWith(MockitoExtension.class)
class RabbitRunQueueAdapterTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Test
    void sendsTheRunAsAMessageToTheRunsQueue() {
        RabbitRunQueueAdapter adapter = new RabbitRunQueueAdapter(rabbitTemplate, "runs");
        QueuedRun run = new QueuedRun(new RunId("77"), new ScenarioId("5"), new Seed(99));

        adapter.enqueueRun(run);

        verify(rabbitTemplate).convertAndSend("runs", new RunMessage("77", "5", 99L));
    }
}
