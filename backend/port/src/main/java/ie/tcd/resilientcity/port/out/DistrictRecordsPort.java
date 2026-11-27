package ie.tcd.resilientcity.port.out;

import ie.tcd.resilientcity.domain.District;
import ie.tcd.resilientcity.domain.DistrictId;

import java.util.List;
import java.util.Optional;

/**
 * Saves and loads districts in Records (PostgreSQL + PostGIS). No use case uses it yet: for now only the
 * temporary startup check calls it, to prove that the database, its tables and the map columns work.
 */
public interface DistrictRecordsPort {

    /**
     * Saves the district, replacing any district already saved with the same ID.
     *
     * @param district the district to save, never {@code null}
     */
    void saveDistrict(District district);

    /**
     * Loads one district.
     *
     * @param districtId the ID of the district to load
     * @return the district, or empty if Records has no district with that ID
     */
    Optional<District> loadDistrict(DistrictId districtId);

    /**
     * Loads every district, ordered by ID.
     *
     * @return the districts, or an empty list if there are none
     */
    List<District> loadDistricts();
}
