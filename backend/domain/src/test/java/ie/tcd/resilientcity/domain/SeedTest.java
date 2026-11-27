package ie.tcd.resilientcity.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ie.tcd.resilientcity.domain.exception.InvalidSeedException;
import org.junit.jupiter.api.Test;

class SeedTest {

    @Test
    void acceptsZeroAsTheSmallestValidSeed() {
        Seed seed = new Seed(0);

        assertThat(seed.value()).isZero();
    }

    @Test
    void rejectsANegativeSeed() {
        assertThatThrownBy(() -> new Seed(-1))
                .isInstanceOf(InvalidSeedException.class)
                .hasMessageContaining("-1");
    }
}
