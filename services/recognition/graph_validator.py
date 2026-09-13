# services/recognition/graph_validator.py
"""
Breakthrough #9: Tarjan's Strongly Connected Components (SCC) cycle detection
and Kahn's Topological Sort for curriculum graphs.
Ensures zero infinite loops and computes linear-scan execution order in O(V + E).
"""
from __future__ import annotations

from collections import deque
from typing import Dict, List, Set


def tarjan_scc(graph: Dict[str, List[str]]) -> List[List[str]]:
    """
    Tarjan's algorithm for finding Strongly Connected Components.
    Complexity: O(V + E) time and O(V) space.
    """
    index_counter = [0]
    stack: List[str] = []
    lowlink: Dict[str, int] = {}
    index: Dict[str, int] = {}
    on_stack: Set[str] = set()
    sccs: List[List[str]] = []

    def strongconnect(v: str) -> None:
        index[v] = index_counter[0]
        lowlink[v] = index_counter[0]
        index_counter[0] += 1
        stack.append(v)
        on_stack.add(v)

        for w in graph.get(v, []):
            if w not in index:
                strongconnect(w)
                lowlink[v] = min(lowlink[v], lowlink[w])
            elif w in on_stack:
                lowlink[v] = min(lowlink[v], index[w])

        if lowlink[v] == index[v]:
            scc: List[str] = []
            while True:
                w = stack.pop()
                on_stack.remove(w)
                scc.append(w)
                if w == v:
                    break
            sccs.append(scc)

    for v in list(graph.keys()):
        if v not in index:
            strongconnect(v)

    return sccs


def validate_curriculum_cycles(graph: Dict[str, List[str]]) -> List[List[str]]:
    """
    Returns list of cycles (SCCs with size > 1 or self-loops).
    Empty list means the graph is a valid DAG.
    """
    sccs = tarjan_scc(graph)
    cycles = []
    for scc in sccs:
        if len(scc) > 1:
            cycles.append(scc)
        elif len(scc) == 1:
            # Check self loop
            node = scc[0]
            if node in graph.get(node, []):
                cycles.append(scc)
    return cycles


def topological_sort(graph: Dict[str, List[str]], all_nodes: Set[str] | None = None) -> List[str]:
    """
    Kahn's algorithm for topological ordering.
    O(V + E) complexity. Raises ValueError if graph contains cycles.
    """
    nodes = set(all_nodes or graph.keys())
    for deps in graph.values():
        nodes.update(deps)

    in_degree = {v: 0 for v in nodes}
    for v in graph:
        for w in graph[v]:
            in_degree[w] = in_degree.get(w, 0) + 1

    queue = deque([v for v in nodes if in_degree[v] == 0])
    order = []

    while queue:
        v = queue.popleft()
        order.append(v)
        for w in graph.get(v, []):
            in_degree[w] -= 1
            if in_degree[w] == 0:
                queue.append(w)

    if len(order) != len(nodes):
        raise ValueError("Graph has cycles; topological ordering impossible.")

    return order
