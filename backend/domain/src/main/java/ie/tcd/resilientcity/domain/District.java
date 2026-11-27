package ie.tcd.resilientcity.domain;

/**
 * A district of the city, the unit that plans are scored and ranked by.
 *
 * @param districtId identifies the district
 * @param name the district's name, for example {@code "Docklands"}
 * @param centre the centre of the district on the map
 */
public record District(DistrictId districtId, String name, Coordinates centre) {
}
