package ie.tcd.resilientcity.adapter.outbound.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.locationtech.jts.geom.Point;

/**
 * A row of the {@code district} table. The centre is a PostGIS point in WGS 84 (SRID 4326).
 */
@Entity
@Table(name = "district")
public class DistrictEntity {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Point centre;

    /**
     * Used by JPA when it loads a row.
     */
    protected DistrictEntity() {
    }

    /**
     * Creates a row to save.
     *
     * @param id the district ID
     * @param name the district's name
     * @param centre the centre of the district, with SRID 4326
     */
    public DistrictEntity(String id, String name, Point centre) {
        this.id = id;
        this.name = name;
        this.centre = centre;
    }

    /**
     * Returns the district ID.
     *
     * @return the district ID
     */
    public String getId() {
        return id;
    }

    /**
     * Returns the district's name.
     *
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * Returns the centre of the district.
     *
     * @return the centre, with SRID 4326
     */
    public Point getCentre() {
        return centre;
    }
}
