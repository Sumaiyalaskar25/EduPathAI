import random
from services.matching.lsh_matcher import LSHIndex


def test_lsh_exact_and_similar_matches():
    dim = 64
    index = LSHIndex(num_bands=8, rows_per_band=4, dim=dim, seed=42)

    rng = random.Random(42)
    vec_a = [rng.gauss(0, 1) for _ in range(dim)]
    # vec_b is very close to vec_a (cosine similarity > 0.95)
    vec_b = [x + rng.gauss(0, 0.05) for x in vec_a]
    # vec_c is orthogonal random vector
    vec_c = [rng.gauss(0, 1) for _ in range(dim)]

    index.insert("course_a", vec_a)
    index.insert("course_c", vec_c)

    # Query with vec_b
    candidates = index.query(vec_b, min_collisions=1)
    assert "course_a" in candidates


def test_lsh_multi_probe():
    dim = 32
    index = LSHIndex(num_bands=4, rows_per_band=4, dim=dim, seed=123)

    rng = random.Random(123)
    vec_1 = [rng.gauss(0, 1) for _ in range(dim)]
    vec_2 = [x + rng.gauss(0, 0.1) for x in vec_1]

    index.insert("target_1", vec_1)
    probed = index.query_multi_probe(vec_2, num_probes=2)
    assert "target_1" in probed
