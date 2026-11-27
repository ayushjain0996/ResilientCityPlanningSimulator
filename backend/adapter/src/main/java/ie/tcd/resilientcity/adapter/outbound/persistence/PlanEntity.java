package ie.tcd.resilientcity.adapter.outbound.persistence;

import java.time.Instant;
import java.util.UUID;

import ie.tcd.resilientcity.domain.plan.Plan;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A row of the plans table. Package-private so that it cannot be used outside the persistence adapter.
 */
@Entity
@Table(name = "plans")
class PlanEntity {

    @Id
    private UUID id;

    @Column(nullable = false, length = Plan.MAX_NAME_LENGTH)
    private String name;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    /**
     * Creates an empty entity. JPA needs this constructor to load rows.
     */
    protected PlanEntity() {
    }

    /**
     * Creates an entity with the given column values.
     *
     * @param id the plan's identifier
     * @param name the plan's name
     * @param createdAt when the plan was created
     */
    PlanEntity(UUID id, String name, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
    }

    /**
     * Returns the plan's identifier.
     *
     * @return the primary key
     */
    UUID getId() {
        return id;
    }

    /**
     * Returns the plan's name.
     *
     * @return the name
     */
    String getName() {
        return name;
    }

    /**
     * Returns when the plan was created.
     *
     * @return the creation time
     */
    Instant getCreatedAt() {
        return createdAt;
    }
}
