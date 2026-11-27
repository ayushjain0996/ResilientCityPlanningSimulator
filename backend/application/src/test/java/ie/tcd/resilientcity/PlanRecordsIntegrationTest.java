package ie.tcd.resilientcity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest
@Import(TestcontainersConfig.class)
class PlanRecordsIntegrationTest {

    private final WebApplicationContext context;

    private MockMvc mockMvc;

    @Autowired
    PlanRecordsIntegrationTest(WebApplicationContext context) {
        this.context = context;
    }

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void readsSeededPlans() throws Exception {
        String body = mockMvc.perform(get("/api/plans"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        List<String> names = JsonPath.read(body, "$[*].name");
        assertThat(names).contains(
                "Dublin Docklands baseline",
                "Dublin Docklands phased growth",
                "Liffey flood resilience");
    }

    @Test
    void readsBackPlanThatWasWritten() throws Exception {
        MockHttpServletResponse created = createPlan("Integration test plan");
        String createdBody = created.getContentAsString();

        String loadedBody = mockMvc.perform(get(created.getHeader("Location")))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        assertThat(textAt(loadedBody, "$.id")).isEqualTo(textAt(createdBody, "$.id"));
        assertThat(textAt(loadedBody, "$.name")).isEqualTo("Integration test plan");
        assertThat(textAt(loadedBody, "$.createdAt")).isEqualTo(textAt(createdBody, "$.createdAt"));
    }

    @Test
    void listsPlanThatWasWritten() throws Exception {
        String id = textAt(createPlan("Listed test plan").getContentAsString(), "$.id");

        String body = mockMvc.perform(get("/api/plans"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        List<String> ids = JsonPath.read(body, "$[*].id");
        assertThat(ids).contains(id);
    }

    @Test
    void listsPlansOldestFirst() throws Exception {
        createPlan("Newest test plan");

        String body = mockMvc.perform(get("/api/plans"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        List<String> createdAt = JsonPath.read(body, "$[*].createdAt");
        assertThat(createdAt.stream().map(Instant::parse).toList()).isSorted();
    }

    @Test
    void reportsNotFoundForUnknownPlan() throws Exception {
        mockMvc.perform(get("/api/plans/{planId}", "00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void rejectsBlankPlanName() throws Exception {
        mockMvc.perform(post("/api/plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\" \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    private MockHttpServletResponse createPlan(String name) throws Exception {
        return mockMvc.perform(post("/api/plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse();
    }

    private static String textAt(String json, String path) {
        return JsonPath.read(json, path);
    }
}
