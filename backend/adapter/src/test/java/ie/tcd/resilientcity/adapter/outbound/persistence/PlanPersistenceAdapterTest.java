package ie.tcd.resilientcity.adapter.outbound.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import ie.tcd.resilientcity.domain.exception.RecordsUnavailableException;
import ie.tcd.resilientcity.domain.plan.Plan;
import ie.tcd.resilientcity.domain.plan.PlanId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.transaction.CannotCreateTransactionException;

@ExtendWith(MockitoExtension.class)
class PlanPersistenceAdapterTest {

    private static final UUID ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final String NAME = "Dublin Docklands baseline";
    private static final Instant CREATED_AT = Instant.parse("2026-01-01T12:00:00Z");
    private static final Plan PLAN = new Plan(new PlanId(ID), NAME, CREATED_AT);

    @Mock
    private PlanJpaRepository planJpaRepository;

    @InjectMocks
    private PlanPersistenceAdapter planPersistenceAdapter;

    @Test
    void savesPlanAsEntity() {
        planPersistenceAdapter.savePlan(PLAN);

        ArgumentCaptor<PlanEntity> saved = ArgumentCaptor.forClass(PlanEntity.class);
        verify(planJpaRepository).save(saved.capture());
        assertThat(saved.getValue().getId()).isEqualTo(ID);
        assertThat(saved.getValue().getName()).isEqualTo(NAME);
        assertThat(saved.getValue().getCreatedAt()).isEqualTo(CREATED_AT);
    }

    @Test
    void loadsAllEntitiesAsPlans() {
        when(planJpaRepository.findAll()).thenReturn(List.of(new PlanEntity(ID, NAME, CREATED_AT)));

        assertThat(planPersistenceAdapter.loadAllPlans()).containsExactly(PLAN);
    }

    @Test
    void loadsNoPlansWhenThereAreNoEntities() {
        when(planJpaRepository.findAll()).thenReturn(List.of());

        assertThat(planPersistenceAdapter.loadAllPlans()).isEmpty();
    }

    @Test
    void loadsEntityWithGivenIdAsPlan() {
        when(planJpaRepository.findById(ID)).thenReturn(Optional.of(new PlanEntity(ID, NAME, CREATED_AT)));

        assertThat(planPersistenceAdapter.loadPlan(new PlanId(ID))).contains(PLAN);
    }

    @Test
    void loadsNothingWhenNoEntityHasTheGivenId() {
        when(planJpaRepository.findById(ID)).thenReturn(Optional.empty());

        assertThat(planPersistenceAdapter.loadPlan(new PlanId(ID))).isEmpty();
    }

    @ParameterizedTest
    @MethodSource("databaseFailures")
    void reportsRecordsUnavailableWhenSavingFails(RuntimeException failure) {
        when(planJpaRepository.save(any())).thenThrow(failure);

        assertThatThrownBy(() -> planPersistenceAdapter.savePlan(PLAN))
                .isInstanceOf(RecordsUnavailableException.class)
                .hasCause(failure);
    }

    @ParameterizedTest
    @MethodSource("databaseFailures")
    void reportsRecordsUnavailableWhenLoadingAllPlansFails(RuntimeException failure) {
        when(planJpaRepository.findAll()).thenThrow(failure);

        assertThatThrownBy(() -> planPersistenceAdapter.loadAllPlans())
                .isInstanceOf(RecordsUnavailableException.class)
                .hasCause(failure);
    }

    @ParameterizedTest
    @MethodSource("databaseFailures")
    void reportsRecordsUnavailableWhenLoadingOnePlanFails(RuntimeException failure) {
        when(planJpaRepository.findById(ID)).thenThrow(failure);

        assertThatThrownBy(() -> planPersistenceAdapter.loadPlan(new PlanId(ID)))
                .isInstanceOf(RecordsUnavailableException.class)
                .hasCause(failure);
    }

    private static Stream<RuntimeException> databaseFailures() {
        return Stream.of(
                new DataAccessResourceFailureException("Query failed"),
                new CannotCreateTransactionException("Database unreachable"));
    }
}
