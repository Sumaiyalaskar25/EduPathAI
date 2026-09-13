# services/matching/lsh_matcher.py
"""
Breakthrough #2: Locality-Sensitive Hashing (LSH) for O(n^1.5) Candidate Matching.
Reduces pairwise cross-encoder comparisons from |S| * |T| down to collision buckets.
"""
from __future__ import annotations

import random
from dataclasses import dataclass, field
from typing import Dict, List, Set, Tuple


@dataclass
class LSHIndex:
    num_bands: int = 16       # k bands
    rows_per_band: int = 8    # r rows
    dim: int = 384
    seed: int = 42

    def __post_init__(self):
        rng = random.Random(self.seed)
        # Random projection hyperplanes: (k * r) hyperplanes of dimension dim
        self.hyperplanes: List[List[float]] = [
            [rng.gauss(0, 1) for _ in range(self.dim)]
            for _ in range(self.num_bands * self.rows_per_band)
        ]
        # Buckets: (band_idx, band_hash) -> list of item IDs
        self.buckets: Dict[Tuple[int, int], List[str]] = {}

    def _hash_band(self, embedding: List[float], band: int) -> int:
        """Hash one band: sign of dot product with each hyperplane."""
        start = band * self.rows_per_band
        hash_value = 0
        for i in range(self.rows_per_band):
            plane = self.hyperplanes[start + i]
            dot = sum(p * e for p, e in zip(plane, embedding))
            if dot > 0:
                hash_value |= (1 << i)
        return hash_value

    def insert(self, item_id: str, embedding: List[float]) -> None:
        for band in range(self.num_bands):
            h = self._hash_band(embedding, band)
            key = (band, h)
            self.buckets.setdefault(key, []).append(item_id)

    def query(self, embedding: List[float], min_collisions: int = 1) -> List[str]:
        """Return candidate IDs that collide in at least min_collisions bands."""
        candidates: Dict[str, int] = {}
        for band in range(self.num_bands):
            h = self._hash_band(embedding, band)
            key = (band, h)
            for item_id in self.buckets.get(key, []):
                candidates[item_id] = candidates.get(item_id, 0) + 1
        return [cid for cid, count in candidates.items() if count >= min_collisions]

    def query_multi_probe(self, embedding: List[float], num_probes: int = 2) -> List[str]:
        """Multi-probe LSH: Probes exact bucket + neighboring buckets with 1-bit Hamming distance."""
        candidates: Dict[str, int] = {}
        for band in range(self.num_bands):
            h = self._hash_band(embedding, band)
            # Exact probe
            for item_id in self.buckets.get((band, h), []):
                candidates[item_id] = candidates.get(item_id, 0) + 1
            # Probe 1-bit flips
            for bit in range(min(self.rows_per_band, num_probes)):
                neighbor = h ^ (1 << bit)
                for item_id in self.buckets.get((band, neighbor), []):
                    candidates[item_id] = candidates.get(item_id, 0) + 1
        return list(candidates.keys())
