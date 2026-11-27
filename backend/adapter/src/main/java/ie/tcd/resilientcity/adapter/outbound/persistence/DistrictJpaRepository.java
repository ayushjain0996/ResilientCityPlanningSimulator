package ie.tcd.resilientcity.adapter.outbound.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data repository for the {@code district} table.
 */
public interface DistrictJpaRepository extends JpaRepository<DistrictEntity, String> {
}
