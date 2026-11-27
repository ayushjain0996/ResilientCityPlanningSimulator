package ie.tcd.resilientcity;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.JwtRequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

@SpringBootTest(properties = "FIREBASE_PROJECT_ID=test-project")
class SecurityIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JwtAuthenticationConverter jwtAuthenticationConverter;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    /** A verified token with the given role, whose authorities come from the application's own converter. */
    private JwtRequestPostProcessor tokenWithRole(String role) {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .subject("uid-1")
                .claim("email", "user@example.com")
                .claim("role", role)
                .build();
        return jwt().jwt(jwt).authorities(jwtAuthenticationConverter.convert(jwt).getAuthorities());
    }

    @Test
    void meReturns401WithoutAToken() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meReturnsTheUidEmailAndRoleOfAPlanner() throws Exception {
        mockMvc.perform(get("/api/me").with(tokenWithRole("PLANNER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uid").value("uid-1"))
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.role").value("PLANNER"));
    }

    @Test
    void aPlannerOnlyMethodReturns403ForAnAuditor() throws Exception {
        mockMvc.perform(get("/api/test/planner-only").with(tokenWithRole("AUDITOR")))
                .andExpect(status().isForbidden());
    }

    @Test
    void aPlannerOnlyMethodReturns200ForAPlanner() throws Exception {
        mockMvc.perform(get("/api/test/planner-only").with(tokenWithRole("PLANNER")))
                .andExpect(status().isOk());
    }

    @Test
    void aPlannerOnlyMethodReturns403ForAUserWithoutARole() throws Exception {
        mockMvc.perform(get("/api/test/planner-only").with(tokenWithRole(null)))
                .andExpect(status().isForbidden());
    }

    @Test
    void healthIsPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void everyOtherEndpointNeedsAToken() throws Exception {
        mockMvc.perform(get("/api/anything-else"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void corsAllowsTheLocalFrontendOrigin() throws Exception {
        mockMvc.perform(options("/api/me")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void corsRejectsAnUnknownOrigin() throws Exception {
        mockMvc.perform(options("/api/me")
                        .header("Origin", "http://evil.example")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }
}
