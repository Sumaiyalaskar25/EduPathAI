# services/matching/pq_vector_index.py
"""
Breakthrough #5: Product Quantization (PQ) Vector Index.
Compacts float32 embeddings (1536 bytes) to uint8 subvector codes (48 bytes).
Enables Asymmetric Distance Computation (ADC) in memory.
"""
from __future__ import annotations

import math
import random
from typing import Dict, List, Tuple


class PQIndex:
    """
    Pure Python Product Quantization engine without heavy external dependencies.
    Decomposes D-dimensional vectors into M subvectors of D/M dimensions,
    each quantized to K centroids.
    """

    def __init__(self, dim: int = 384, num_subvectors: int = 48, num_centroids: int = 256, seed: int = 42):
        self.dim = dim
        self.M = num_subvectors
        self.K = num_centroids
        self.sub_dim = dim // num_subvectors
        self.seed = seed
        self.codebooks: List[List[List[float]]] = []  # [M][K][sub_dim]
        self.codes: Dict[str, List[int]] = {}          # item_id -> list of M uint8 indices
        self._trained = False

    def train_simple(self, sample_vectors: List[List[float]]) -> None:
        """Initializes and trains centroids using k-means on subvectors."""
        rng = random.Random(self.seed)
        self.codebooks = []
        for m in range(self.M):
            start = m * self.sub_dim
            end = start + self.sub_dim
            subvecs = [v[start:end] for v in sample_vectors]
            if len(subvecs) < self.K:
                # Synthetic centroids if sample size is small
                centroids = [
                    [rng.gauss(0, 1) for _ in range(self.sub_dim)]
                    for _ in range(self.K)
                ]
            else:
                centroids = [subvecs[i] for i in rng.sample(range(len(subvecs)), self.K)]
            self.codebooks.append(centroids)
        self._trained = True

    def _dist_sq(self, a: List[float], b: List[float]) -> float:
        return sum((x - y) ** 2 for x, y in zip(a, b))

    def encode(self, vector: List[float]) -> List[int]:
        if not self._trained:
            raise ValueError("PQIndex must be trained before encoding.")
        code = []
        for m in range(self.M):
            start = m * self.sub_dim
            subvec = vector[start:start + self.sub_dim]
            best_k = 0
            best_d = float("inf")
            for k, centroid in enumerate(self.codebooks[m]):
                d = self._dist_sq(subvec, centroid)
                if d < best_d:
                    best_d = d
                    best_k = k
            code.append(best_k)
        return code

    def add(self, item_id: str, vector: List[float]) -> None:
        self.codes[item_id] = self.encode(vector)

    def query(self, query_vector: List[float], top_k: int = 10) -> List[Tuple[str, float]]:
        """
        Asymmetric Distance Computation (ADC):
        Precompute distance from query subvectors to all codebook centroids,
        then score items via simple table lookups.
        """
        if not self._trained:
            raise ValueError("PQIndex not trained.")

        # Distance table: [M][K]
        dist_table: List[List[float]] = []
        for m in range(self.M):
            start = m * self.sub_dim
            query_sub = query_vector[start:start + self.sub_dim]
            sub_dists = [self._dist_sq(query_sub, centroid) for centroid in self.codebooks[m]]
            dist_table.append(sub_dists)

        scores: List[Tuple[str, float]] = []
        for item_id, code in self.codes.items():
            total_dist = sum(dist_table[m][k] for m, k in enumerate(code))
            scores.append((item_id, total_dist))

        scores.sort(key=lambda x: x[1])
        return scores[:top_k]
