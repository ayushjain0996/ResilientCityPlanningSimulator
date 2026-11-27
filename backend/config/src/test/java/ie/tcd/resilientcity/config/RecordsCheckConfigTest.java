package ie.tcd.resilientcity.config;

import static org.assertj.core.api.Assertions.assertThat;

import ie.tcd.resilientcity.domain.District;
import ie.tcd.resilientcity.domain.DistrictId;
import ie.tcd.resilientcity.port.out.DistrictRecordsPort;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import org.junit.jupiter.api.Test;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.support.GenericApplicationContext;

class RecordsCheckConfigTest {

    @Test
    void savesTheCheckDistrictAndReadsItBackWhenTheApplicationStarts() {
        FakeDistrictRecords records = new FakeDistrictRecords();

        new RecordsCheckConfig().recordsCheck(records)
                .onApplicationEvent(new ContextRefreshedEvent(new GenericApplicationContext()));

        assertThat(records.saved).containsExactly(RecordsCheckConfig.CHECK_DISTRICT);
        assertThat(records.loadedIds).containsExactly(RecordsCheckConfig.CHECK_DISTRICT.districtId());
        assertThat(records.loadedAll).isTrue();
    }

    private static final class FakeDistrictRecords implements DistrictRecordsPort {

        private final Map<String, District> districts = new TreeMap<>();
        private final List<District> saved = new ArrayList<>();
        private final List<DistrictId> loadedIds = new ArrayList<>();
        private boolean loadedAll;

        @Override
        public void saveDistrict(District district) {
            saved.add(district);
            districts.put(district.districtId().value(), district);
        }

        @Override
        public Optional<District> loadDistrict(DistrictId districtId) {
            loadedIds.add(districtId);
            return Optional.ofNullable(districts.get(districtId.value()));
        }

        @Override
        public List<District> loadDistricts() {
            loadedAll = true;
            return List.copyOf(districts.values());
        }
    }
}
