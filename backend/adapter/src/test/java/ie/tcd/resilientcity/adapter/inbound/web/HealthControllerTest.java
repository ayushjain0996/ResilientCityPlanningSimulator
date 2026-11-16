package ie.tcd.resilientcity.adapter.inbound.web;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import ie.tcd.resilientcity.domain.HealthStatus;
import ie.tcd.resilientcity.port.in.HealthCheckUseCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class HealthControllerTest {

    @Mock
    private HealthCheckUseCase healthCheckUseCase;

    @Test
    void returnsUpStatusAsJson() throws Exception {
        when(healthCheckUseCase.checkHealth()).thenReturn(HealthStatus.UP);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new HealthController(healthCheckUseCase)).build();

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
