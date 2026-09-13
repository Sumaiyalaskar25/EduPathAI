# services/cache/bloom_filter.py
"""
Breakthrough #7: Bloom Filter Negative Cache.
Prunes non-existent curriculum lookups before touching DB in O(1).
"""
from __future__ import annotations

import hashlib
import math
from typing import List


class BloomFilter:
    def __init__(self, expected_items: int = 10_000, false_positive_rate: float = 0.01):
        self.expected_items = expected_items
        self.false_positive_rate = false_positive_rate
        # Optimal bit array size m = - (n * ln(p)) / (ln(2)^2)
        self.size = max(64, int(-expected_items * math.log(false_positive_rate) / (math.log(2) ** 2)))
        # Optimal number of hash functions k = (m / n) * ln(2)
        self.num_hashes = max(1, int((self.size / expected_items) * math.log(2)))
        self.bits = bytearray((self.size + 7) // 8)
        self.count = 0

    def _hashes(self, item: str) -> List[int]:
        item_bytes = item.encode("utf-8")
        h1 = int.from_bytes(hashlib.md5(item_bytes).digest()[:8], "big")
        h2 = int.from_bytes(hashlib.sha1(item_bytes).digest()[:8], "big")
        return [(h1 + i * h2) % self.size for i in range(self.num_hashes)]

    def add(self, item: str) -> None:
        for bit_idx in self._hashes(item):
            self.bits[bit_idx // 8] |= (1 << (bit_idx % 8))
        self.count += 1

    def might_contain(self, item: str) -> bool:
        """Returns False if item is DEFINITELY not present; True if POSSIBLY present."""
        for bit_idx in self._hashes(item):
            if not (self.bits[bit_idx // 8] & (1 << (bit_idx % 8))):
                return False
        return True
