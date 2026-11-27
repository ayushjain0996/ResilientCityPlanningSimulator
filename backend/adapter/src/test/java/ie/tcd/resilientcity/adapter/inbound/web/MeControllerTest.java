package ie.tcd.resilientcity.adapter.inbound.web;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class MeControllerTest {

    private final MeController controller = new MeController();

    private Jwt.Builder token() {
        return Jwt.withTokenValue("token").header("alg", "RS256").subject("uid-1");
    }

    @Test
    void returnsTheUidEmailAndRoleFromTheToken() {
        Jwt jwt = token().claim("email", "planner@example.com").claim("role", "PLANNER").build();

        MeResponse response = controller.me(jwt);

        assertThat(response).isEqualTo(new MeResponse("uid-1", "planner@example.com", "PLANNER"));
    }

    @Test
    void returnsNoRoleWhenTheTokenHasNoRoleClaim() {
        Jwt jwt = token().claim("email", "new@example.com").build();

        MeResponse response = controller.me(jwt);

        assertThat(response.role()).isNull();
        assertThat(response.uid()).isEqualTo("uid-1");
    }
}
