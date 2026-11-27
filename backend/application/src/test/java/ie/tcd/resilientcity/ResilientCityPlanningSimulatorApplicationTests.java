package ie.tcd.resilientcity;

import static org.assertj.core.api.Assertions.assertThat;

import ie.tcd.resilientcity.domain.Coordinates;
import ie.tcd.resilientcity.domain.District;
import ie.tcd.resilientcity.domain.DistrictId;
import ie.tcd.resilientcity.port.out.DistrictRecordsPort;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(PostgisTestcontainersConfig.class)
class ResilientCityPlanningSimulatorApplicationTests {

    private final DistrictRecordsPort districtRecordsPort;

    @Autowired
    ResilientCityPlanningSimulatorApplicationTests(DistrictRecordsPort districtRecordsPort) {
        this.districtRecordsPort = districtRecordsPort;
    }

    @Test
    void contextLoads() {
    }

    @Test
    void createsTheDistrictTableAndLoadsTheStartingDataOnStartup() {
        assertThat(districtRecordsPort.loadDistrict(new DistrictId("D01")))
                .contains(new District(new DistrictId("D01"), "City Centre", new Coordinates(-6.2603, 53.3498)));
        assertThat(districtRecordsPort.loadDistricts())
                .extracting(district -> district.districtId().value())
                .contains("D01", "D02", "D03");
    }

    @Test
    void runsTheRecordsCheckOnStartup() {
        assertThat(districtRecordsPort.loadDistrict(new DistrictId("startup-check"))).isPresent();
    }

    @Test
    void savesADistrictToPostgisAndReadsItBack() {
        District district = new District(new DistrictId("T01"), "Trinity", new Coordinates(-6.2546, 53.3438));

        districtRecordsPort.saveDistrict(district);

        assertThat(districtRecordsPort.loadDistrict(new DistrictId("T01"))).contains(district);
    }

    @Test
    void replacesADistrictSavedAgainWithTheSameId() {
        districtRecordsPort.saveDistrict(new District(new DistrictId("T02"), "Old name", new Coordinates(0, 0)));
        District renamed = new District(new DistrictId("T02"), "New name", new Coordinates(1, 2));

        districtRecordsPort.saveDistrict(renamed);

        assertThat(districtRecordsPort.loadDistrict(new DistrictId("T02"))).contains(renamed);
    }
}
