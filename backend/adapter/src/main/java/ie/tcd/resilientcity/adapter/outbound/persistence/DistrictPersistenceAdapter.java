package ie.tcd.resilientcity.adapter.outbound.persistence;

import ie.tcd.resilientcity.domain.Coordinates;
import ie.tcd.resilientcity.domain.District;
import ie.tcd.resilientcity.domain.DistrictId;
import ie.tcd.resilientcity.domain.exception.RecordsAccessException;
import ie.tcd.resilientcity.port.out.DistrictRecordsPort;

import java.util.List;
import java.util.Optional;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

/**
 * Stores districts in the {@code district} table of PostgreSQL + PostGIS, converting between
 * {@link District} and {@link DistrictEntity}.
 */
@Component
public class DistrictPersistenceAdapter implements DistrictRecordsPort {

    private static final int WGS84_SRID = 4326;
    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), WGS84_SRID);

    private final DistrictJpaRepository districtJpaRepository;

    /**
     * Creates the adapter.
     *
     * @param districtJpaRepository the repository for the {@code district} table
     */
    public DistrictPersistenceAdapter(DistrictJpaRepository districtJpaRepository) {
        this.districtJpaRepository = districtJpaRepository;
    }

    @Override
    public void saveDistrict(District district) {
        try {
            districtJpaRepository.save(toEntity(district));
        } catch (DataAccessException exception) {
            throw new RecordsAccessException("Could not save district " + district.districtId().value(), exception);
        }
    }

    @Override
    public Optional<District> loadDistrict(DistrictId districtId) {
        try {
            return districtJpaRepository.findById(districtId.value()).map(this::toDomain);
        } catch (DataAccessException exception) {
            throw new RecordsAccessException("Could not load district " + districtId.value(), exception);
        }
    }

    @Override
    public List<District> loadDistricts() {
        try {
            return districtJpaRepository.findAll(Sort.by("id")).stream()
                    .map(this::toDomain)
                    .toList();
        } catch (DataAccessException exception) {
            throw new RecordsAccessException("Could not load the districts", exception);
        }
    }

    private DistrictEntity toEntity(District district) {
        Coordinates centre = district.centre();
        Point point = GEOMETRY_FACTORY.createPoint(new Coordinate(centre.longitude(), centre.latitude()));
        return new DistrictEntity(district.districtId().value(), district.name(), point);
    }

    private District toDomain(DistrictEntity entity) {
        Point centre = entity.getCentre();
        return new District(
                new DistrictId(entity.getId()),
                entity.getName(),
                new Coordinates(centre.getX(), centre.getY()));
    }
}
