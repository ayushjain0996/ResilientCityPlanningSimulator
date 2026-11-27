package ie.tcd.resilientcity.config;

import ie.tcd.resilientcity.domain.Coordinates;
import ie.tcd.resilientcity.domain.District;
import ie.tcd.resilientcity.domain.DistrictId;
import ie.tcd.resilientcity.port.out.DistrictRecordsPort;

import java.util.List;
import java.util.Optional;

import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.ContextRefreshedEvent;

/**
 * TEMPORARY check that Records works with PostgreSQL + PostGIS. Remove it once a real use case saves and
 * loads records.
 */
@Configuration
public class RecordsCheckConfig {

    static final District CHECK_DISTRICT = new District(
            new DistrictId("startup-check"),
            "Startup check",
            new Coordinates(-6.2546, 53.3438));

    private static final System.Logger LOGGER = System.getLogger(RecordsCheckConfig.class.getName());

    /**
     * Once the application has started, saves {@link #CHECK_DISTRICT}, reads it back and logs every district
     * in Records. Saving replaces the same row, so restarting the application does not add rows.
     *
     * @param districtRecordsPort where districts are saved and loaded
     * @return the listener that runs the check
     */
    @Bean
    public ApplicationListener<ContextRefreshedEvent> recordsCheck(DistrictRecordsPort districtRecordsPort) {
        return event -> {
            districtRecordsPort.saveDistrict(CHECK_DISTRICT);
            Optional<District> readBack = districtRecordsPort.loadDistrict(CHECK_DISTRICT.districtId());
            List<District> districts = districtRecordsPort.loadDistricts();
            LOGGER.log(System.Logger.Level.INFO, "Records check: saved {0}, read back {1}", CHECK_DISTRICT, readBack);
            LOGGER.log(
                    System.Logger.Level.INFO,
                    "Records check: {0} districts in Records: {1}",
                    districts.size(),
                    districts);
        };
    }
}
