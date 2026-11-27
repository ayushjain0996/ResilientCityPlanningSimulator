package ie.tcd.resilientcity.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.core.Queue;

class RabbitConfigTest {

    @Test
    void declaresADurableRunsQueueNamedFromTheSettings() {
        Queue queue = new RabbitConfig().runsQueue("runs");

        assertThat(queue.getName()).isEqualTo("runs");
        assertThat(queue.isDurable()).isTrue();
    }

    @Test
    void writesMessagesAsJson() {
        Message message = new RabbitConfig().jsonMessageConverter()
                .toMessage(new Ticket("77", 99L), new MessageProperties());

        assertThat(new String(message.getBody(), StandardCharsets.UTF_8)).isEqualTo("{\"runId\":\"77\",\"seed\":99}");
        assertThat(message.getMessageProperties().getContentType()).isEqualTo("application/json");
    }

    record Ticket(String runId, long seed) { }
}
