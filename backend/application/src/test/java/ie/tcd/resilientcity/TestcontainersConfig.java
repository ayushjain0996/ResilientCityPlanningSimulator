package ie.tcd.resilientcity;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Gives tests a throwaway PostgreSQL + PostGIS database. Uses the same image as compose.yaml.
 */
@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfig {

    private static final DockerImageName POSTGIS_IMAGE =
            DockerImageName.parse("postgis/postgis:17-3.5").asCompatibleSubstituteFor("postgres");
    private static final String IMAGE_PLATFORM = "linux/amd64";

    /**
     * Creates the database container, which Spring Boot starts and connects the application to.
     *
     * @return the container, pinned to the only platform its image is published for
     */
    @Bean
    @ServiceConnection
    PostgreSQLContainer postgresContainer() {
        return new PostgreSQLContainer(POSTGIS_IMAGE)
                .withCreateContainerCmdModifier(command -> command.withPlatform(IMAGE_PLATFORM));
    }
}
