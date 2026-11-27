package ie.tcd.resilientcity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Exists only in the test sources, to prove that role checks on methods work. */
@RestController
class PlannerOnlyTestController {

    @GetMapping("/api/test/planner-only")
    @PreAuthorize("hasRole('PLANNER')")
    String plannerOnly() {
        return "planner";
    }
}
