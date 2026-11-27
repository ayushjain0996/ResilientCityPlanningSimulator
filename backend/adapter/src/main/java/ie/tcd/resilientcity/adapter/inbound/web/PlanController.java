package ie.tcd.resilientcity.adapter.inbound.web;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import ie.tcd.resilientcity.domain.exception.InvalidPlanNameException;
import ie.tcd.resilientcity.domain.exception.PlanNotFoundException;
import ie.tcd.resilientcity.domain.exception.RecordsUnavailableException;
import ie.tcd.resilientcity.domain.plan.Plan;
import ie.tcd.resilientcity.domain.plan.PlanId;
import ie.tcd.resilientcity.port.in.CreatePlanUseCase;
import ie.tcd.resilientcity.port.in.LoadPlansUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * The REST API for plans. {@link ApiExceptionHandler} turns the exceptions into error responses.
 */
@RestController
public class PlanController {

    private final CreatePlanUseCase createPlanUseCase;
    private final LoadPlansUseCase loadPlansUseCase;

    /**
     * Creates the controller.
     *
     * @param createPlanUseCase creates plans
     * @param loadPlansUseCase loads stored plans
     */
    public PlanController(CreatePlanUseCase createPlanUseCase, LoadPlansUseCase loadPlansUseCase) {
        this.createPlanUseCase = createPlanUseCase;
        this.loadPlansUseCase = loadPlansUseCase;
    }

    /**
     * Creates a plan.
     *
     * @param request the name of the plan to create
     * @return {@code 201 Created} with the new plan, and its address in the {@code Location} header
     * @throws InvalidPlanNameException if the name is missing, blank or too long
     * @throws RecordsUnavailableException if Records cannot be written
     */
    @PostMapping("/api/plans")
    public ResponseEntity<PlanResponse> createPlan(@RequestBody CreatePlanRequest request) {
        Plan plan = createPlanUseCase.createPlan(request.name());
        PlanResponse response = PlanResponse.from(plan);
        // A relative address stays correct behind Firebase Hosting and the Vite proxy.
        return ResponseEntity.created(URI.create("/api/plans/" + response.id())).body(response);
    }

    /**
     * Returns every stored plan.
     *
     * @return the stored plans, or an empty list if there are none
     * @throws RecordsUnavailableException if Records cannot be read
     */
    @GetMapping("/api/plans")
    public List<PlanResponse> loadAllPlans() {
        return loadPlansUseCase.loadAllPlans().stream()
                .map(PlanResponse::from)
                .toList();
    }

    /**
     * Returns one stored plan.
     *
     * @param planId the ID of the plan to return
     * @return the plan
     * @throws PlanNotFoundException if no plan has this ID
     * @throws RecordsUnavailableException if Records cannot be read
     */
    @GetMapping("/api/plans/{planId}")
    public PlanResponse loadPlan(@PathVariable UUID planId) {
        PlanId id = new PlanId(planId);
        return loadPlansUseCase.loadPlan(id)
                .map(PlanResponse::from)
                .orElseThrow(() -> new PlanNotFoundException(id));
    }
}
