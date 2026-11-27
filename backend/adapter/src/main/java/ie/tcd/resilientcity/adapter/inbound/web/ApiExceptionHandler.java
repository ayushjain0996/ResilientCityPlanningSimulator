package ie.tcd.resilientcity.adapter.inbound.web;

import ie.tcd.resilientcity.domain.exception.InvalidPlanNameException;
import ie.tcd.resilientcity.domain.exception.PlanNotFoundException;
import ie.tcd.resilientcity.domain.exception.RecordsUnavailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Turns exceptions into Problem Details responses (RFC 9457) for the whole REST API. The superclass does the same for
 * Spring MVC's own exceptions, such as a malformed request body.
 */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Creates the exception handler.
     */
    public ApiExceptionHandler() {
    }

    /**
     * Reports a plan that does not exist.
     *
     * @param exception the exception to report
     * @return a {@code 404 Not Found} problem
     */
    @ExceptionHandler
    public ProblemDetail handlePlanNotFound(PlanNotFoundException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    /**
     * Reports a plan name that breaks the naming rule.
     *
     * @param exception the exception to report
     * @return a {@code 400 Bad Request} problem
     */
    @ExceptionHandler
    public ProblemDetail handleInvalidPlanName(InvalidPlanNameException exception) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, exception.getMessage());
    }

    /**
     * Reports that Records cannot be reached. Logs the cause here, because the response leaves out database details.
     *
     * @param exception the exception to report
     * @return a {@code 503 Service Unavailable} problem
     */
    @ExceptionHandler
    public ProblemDetail handleRecordsUnavailable(RecordsUnavailableException exception) {
        logger.error(exception.getMessage(), exception);
        return ProblemDetail.forStatusAndDetail(HttpStatus.SERVICE_UNAVAILABLE, exception.getMessage());
    }
}
