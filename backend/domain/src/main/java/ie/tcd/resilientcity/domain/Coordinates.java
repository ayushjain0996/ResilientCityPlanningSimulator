package ie.tcd.resilientcity.domain;

/**
 * A point on the map in WGS 84 (the latitude and longitude used by GPS).
 *
 * @param longitude degrees east of Greenwich, negative for west
 * @param latitude degrees north of the equator, negative for south
 */
public record Coordinates(double longitude, double latitude) {
}
