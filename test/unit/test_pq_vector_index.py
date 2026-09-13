import random
from services.matching.pq_vector_index import PQIndex


def test_pq_train_encode_and_query():
    dim = 32
    num_sub = 4  # 8 dims per subvector
    num_centroids = 16

    pq = PQIndex(dim=dim, num_subvectors=num_sub, num_centroids=num_centroids, seed=42)

    rng = random.Random(42)
    sample_vectors = [[rng.gauss(0, 1) for _ in range(dim)] for _ in range(50)]
    pq.train_simple(sample_vectors)

    # Encode vector
    target_vec = sample_vectors[0]
    pq.add("item_0", target_vec)

    other_vec = [rng.gauss(0, 1) for _ in range(dim)]
    pq.add("item_other", other_vec)

    # Query with identical vector to target
    results = pq.query(target_vec, top_k=2)
    assert len(results) > 0
    # Closest item should be item_0 with near 0 distance
    assert results[0][0] == "item_0"
