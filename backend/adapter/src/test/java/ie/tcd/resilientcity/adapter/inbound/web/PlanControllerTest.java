package ie.tcd.resilientcity.adapter.inbound.web;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import ie.tcd.resilientcity.domain.exception.InvalidPlanNameException;
import ie.tcd.resilientcity.domain.exception.RecordsUnavailableException;
import ie.tcd.resilientcity.domain.plan.Plan;
import ie.tcd.resilientcity.domain.plan.PlanId;
import ie.tcd.resilientcity.port.in.CreatePlanUseCase;
import ie.tcd.resilientcity.port.in.LoadPlansUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class PlanControllerTest {

    private static final String ID = "00000000-0000-0000-0000-000000000001";
    private static final String NAME = "Dublin Docklands baseline";
    private static final String CREATED_AT = "2026-01-01T12:00:00Z";
    private static final PlanId PLAN_ID = new PlanId(UUID.fromString(ID));
    private static final Plan PLAN = new Plan(PLAN_ID, NAME, Instant.parse(CREATED_AT));

    @Mock
    private CreatePlanUseCase createPlanUseCase;

    @Mock
    private LoadPlansUseCase loadPlansUseCase;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new PlanController(createPlanUseCase, loadPlansUseCase))
                .setControllerAdvice(new ApiExceptionHandler())
                .build();
    }

    @Test
    void returnsCreatedPlanWithItsLocation() throws Exception {
        when(createPlanUseCase.createPlan(NAME)).thenReturn(PLAN);

        mockMvc.perform(post("/api/plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + NAME + "\"}"))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/plans/" + ID))
                .andExpect(jsonPath("$.id").value(ID))
                .andExpect(jsonPath("$.name").value(NAME))
                .andExpect(jsonPath("$.createdAt").value(CREATED_AT));
    }

    @Test
    void returnsAllPlans() throws Exception {
        when(loadPlansUseCase.loadAllPlans()).thenReturn(List.of(PLAN));

        mockMvc.perform(get("/api/plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(ID))
                .andExpect(jsonPath("$[0].name").value(NAME))
                .andExpect(jsonPath("$[0].createdAt").value(CREATED_AT));
    }

    @Test
    void returnsEmptyListWhenThereAreNoPlans() throws Exception {
        when(loadPlansUseCase.loadAllPlans()).thenReturn(List.of());

        mockMvc.perform(get("/api/plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void returnsPlanWithGivenId() throws Exception {
        when(loadPlansUseCase.loadPlan(PLAN_ID)).thenReturn(Optional.of(PLAN));

        mockMvc.perform(get("/api/plans/{planId}", ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ID))
                .andExpect(jsonPath("$.name").value(NAME))
                .andExpect(jsonPath("$.createdAt").value(CREATED_AT));
    }

    @Test
    void reportsNotFoundWhenNoPlanHasTheGivenId() throws Exception {
        when(loadPlansUseCase.loadPlan(PLAN_ID)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/plans/{planId}", ID))
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void reportsBadRequestWhenPlanNameIsInvalid() throws Exception {
        when(createPlanUseCase.createPlan(" "))
                .thenThrow(new InvalidPlanNameException(" ", Plan.MAX_NAME_LENGTH));

        mockMvc.perform(post("/api/plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\" \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void reportsBadRequestWhenPlanIdIsNotAUuid() throws Exception {
        mockMvc.perform(get("/api/plans/{planId}", "not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void reportsBadRequestWhenBodyIsNotValidJson() throws Exception {
        mockMvc.perform(post("/api/plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void reportsServiceUnavailableWhenRecordsAreUnavailable() throws Exception {
        when(loadPlansUseCase.loadAllPlans())
                .thenThrow(new RecordsUnavailableException("Could not load plans", new RuntimeException()));

        mockMvc.perform(get("/api/plans"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(503));
    }
}
