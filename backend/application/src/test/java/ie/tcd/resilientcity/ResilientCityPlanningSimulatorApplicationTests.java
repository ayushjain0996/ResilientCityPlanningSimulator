package ie.tcd.resilientcity;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfig.class)
class ResilientCityPlanningSimulatorApplicationTests {

    @Test
    void contextLoads() {
    }
}
