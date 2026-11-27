package ie.tcd.resilientcity.adapter.outbound.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import ie.tcd.resilientcity.domain.Coordinates;
import ie.tcd.resilientcity.domain.District;
import ie.tcd.resilientcity.domain.DistrictId;
import ie.tcd.resilientcity.domain.exception.RecordsAccessException;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class DistrictPersistenceAdapterTest {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    @Mock
    private DistrictJpaRepository districtJpaRepository;

    @Test
    void savesTheDistrictAsAPointWithSrid4326() {
        DistrictPersistenceAdapter adapter = new DistrictPersistenceAdapter(districtJpaRepository);

        adapter.saveDistrict(new District(new DistrictId("D01"), "City Centre", new Coordinates(-6.26, 53.35)));

        ArgumentCaptor<DistrictEntity> saved = ArgumentCaptor.forClass(DistrictEntity.class);
        verify(districtJpaRepository).save(saved.capture());
        assertThat(saved.getValue().getId()).isEqualTo("D01");
        assertThat(saved.getValue().getName()).isEqualTo("City Centre");
        assertThat(saved.getValue().getCentre().getX()).isEqualTo(-6.26);
        assertThat(saved.getValue().getCentre().getY()).isEqualTo(53.35);
        assertThat(saved.getValue().getCentre().getSRID()).isEqualTo(4326);
    }

    @Test
    void loadsADistrictById() {
        when(districtJpaRepository.findById("D01")).thenReturn(Optional.of(entity("D01", "City Centre", -6.26, 53.35)));
        DistrictPersistenceAdapter adapter = new DistrictPersistenceAdapter(districtJpaRepository);

        Optional<District> district = adapter.loadDistrict(new DistrictId("D01"));

        assertThat(district)
                .contains(new District(new DistrictId("D01"), "City Centre", new Coordinates(-6.26, 53.35)));
    }

    @Test
    void returnsEmptyWhenNoDistrictHasTheId() {
        when(districtJpaRepository.findById("D99")).thenReturn(Optional.empty());
        DistrictPersistenceAdapter adapter = new DistrictPersistenceAdapter(districtJpaRepository);

        assertThat(adapter.loadDistrict(new DistrictId("D99"))).isEmpty();
    }

    @Test
    void loadsEveryDistrictOrderedById() {
        when(districtJpaRepository.findAll(Sort.by("id"))).thenReturn(List.of(
                entity("D01", "City Centre", -6.26, 53.35),
                entity("D02", "Docklands", -6.24, 53.35)));
        DistrictPersistenceAdapter adapter = new DistrictPersistenceAdapter(districtJpaRepository);

        assertThat(adapter.loadDistricts())
                .extracting(District::name)
                .containsExactly("City Centre", "Docklands");
    }

    @Test
    void wrapsDatabaseFailuresInRecordsAccessException() {
        DataAccessResourceFailureException failure = new DataAccessResourceFailureException("database is down");
        when(districtJpaRepository.save(any())).thenThrow(failure);
        DistrictPersistenceAdapter adapter = new DistrictPersistenceAdapter(districtJpaRepository);
        District district = new District(new DistrictId("D01"), "City Centre", new Coordinates(-6.26, 53.35));

        assertThatThrownBy(() -> adapter.saveDistrict(district))
                .isInstanceOf(RecordsAccessException.class)
                .hasMessageContaining("D01")
                .hasCause(failure);
    }

    private static DistrictEntity entity(String id, String name, double longitude, double latitude) {
        return new DistrictEntity(id, name, GEOMETRY_FACTORY.createPoint(new Coordinate(longitude, latitude)));
    }
}
