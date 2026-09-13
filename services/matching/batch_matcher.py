# services/matching/batch_matcher.py
"""
Breakthrough #10: Async Batching and Speculative Parallelism.
Batches candidate pair evaluations and executes them concurrently with bounded semaphores.
"""
from __future__ import annotations

import asyncio
from typing import Any, Callable, Coroutine, List, TypeVar

T = TypeVar("T")
R = TypeVar("R")


def chunk_list(items: List[T], chunk_size: int) -> List[List[T]]:
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]


class AsyncBatchProcessor:
    def __init__(self, batch_size: int = 20, max_concurrency: int = 4):
        self.batch_size = batch_size
        self.semaphore = asyncio.Semaphore(max_concurrency)

    async def process_all(
        self,
        items: List[T],
        batch_func: Callable[[List[T]], Coroutine[Any, Any, List[R]]]
    ) -> List[R]:
        """
        Splits items into batches of `batch_size` and runs up to `max_concurrency` batches concurrently.
        """
        if not items:
            return []

        batches = chunk_list(items, self.batch_size)

        async def _run_batch(b: List[T]) -> List[R]:
            async with self.semaphore:
                return await batch_func(b)

        tasks = [_run_batch(b) for b in batches]
        results = await asyncio.gather(*tasks)
        flattened: List[R] = [item for sublist in results for item in sublist]
        return flattened
