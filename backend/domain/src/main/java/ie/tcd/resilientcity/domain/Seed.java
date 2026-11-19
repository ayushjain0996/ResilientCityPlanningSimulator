package ie.tcd.resilientcity.domain;

import ie.tcd.resilientcity.domain.exception.InvalidSeedException;

public record Seed(long value) {

    public Seed {
        if (value < 0) {
            throw new InvalidSeedException(value);
        }
    }
}
