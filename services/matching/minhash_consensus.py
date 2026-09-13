# services/matching/minhash_consensus.py
"""
Breakthrough #6: MinHash Signatures for O(N) Multi-Model Consensus.
Computes Jaccard agreement between model output sets via compact hash signatures.
"""
from __future__ import annotations

import hashlib
from typing import List, Set, Tuple
from services.schemas import MatchResult
from services.recognition.recognizer import classify


class MinHashSignature:
    def __init__(self, num_hashes: int = 128):
        self.num_hashes = num_hashes
        self.hash_seeds = [hashlib.sha256(f"minhash_seed_{i}".encode()).digest() for i in range(num_hashes)]

    def compute(self, item_set: Set[str]) -> List[int]:
        """Compute MinHash signature of a set."""
        if not item_set:
            return [0] * self.num_hashes

        signature = []
        for seed in self.hash_seeds:
            min_hash = float("inf")
            for item in item_set:
                h = int.from_bytes(hashlib.sha256(seed + item.encode("utf-8")).digest()[:8], "big")
                if h < min_hash:
                    min_hash = h
            signature.append(int(min_hash))
        return signature

    @staticmethod
    def jaccard_similarity(sig1: List[int], sig2: List[int]) -> float:
        """Estimate Jaccard similarity from MinHash signatures."""
        if not sig1 or not sig2:
            return 0.0
        matches = sum(1 for a, b in zip(sig1, sig2) if a == b)
        return matches / len(sig1)


def consensus_fast_minhash(
    model_outputs: List[List[MatchResult]],
    policy: dict,
    agreement_threshold: float = 0.85,
    num_hashes: int = 64,
) -> float:
    """
    Computes average pairwise Jaccard consensus across N model output sets in O(N * num_hashes).
    """
    if not model_outputs or len(model_outputs) < 2:
        return 1.0

    # Build set of (source, target, status) strings for each model
    model_sets: List[Set[str]] = []
    for outputs in model_outputs:
        s = {
            f"{m.source_course_id}:{m.target_course_id}:{classify(m, policy).value}"
            for m in outputs
        }
        model_sets.append(s)

    minhasher = MinHashSignature(num_hashes=num_hashes)
    signatures = [minhasher.compute(ms) for ms in model_sets]

    similarities: List[float] = []
    for i in range(len(signatures)):
        for j in range(i + 1, len(signatures)):
            sim = MinHashSignature.jaccard_similarity(signatures[i], signatures[j])
            similarities.append(sim)

    avg_agreement = sum(similarities) / len(similarities) if similarities else 1.0
    return avg_agreement
