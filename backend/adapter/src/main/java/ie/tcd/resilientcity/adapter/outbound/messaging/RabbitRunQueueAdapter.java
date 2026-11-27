package ie.tcd.resilientcity.adapter.outbound.messaging;

import ie.tcd.resilientcity.domain.QueuedRun;
import ie.tcd.resilientcity.port.out.RunQueuePort;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RabbitRunQueueAdapter implements RunQueuePort {

    private final RabbitTemplate rabbitTemplate;
    private final String queueName;

    public RabbitRunQueueAdapter(
            RabbitTemplate rabbitTemplate,
            @Value("${resilientcity.queue.runs}") String queueName) {
        this.rabbitTemplate = rabbitTemplate;
        this.queueName = queueName;
    }

    @Override
    public void enqueueRun(QueuedRun run) {
        RunMessage message = new RunMessage(run.runId().value(), run.scenarioId().value(), run.seed().value());
        rabbitTemplate.convertAndSend(queueName, message);
    }
}
