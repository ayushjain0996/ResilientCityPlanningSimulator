package ie.tcd.resilientcity.adapter.outbound.persistence;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Reads and writes rows of the plans table. Spring Data generates the implementation.
 */
interface PlanJpaRepository extends JpaRepository<PlanEntity, UUID> {
}
