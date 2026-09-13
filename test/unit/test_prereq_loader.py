from services.solver.prereq_loader import PrereqHypergraph


def test_and_logic():
    h = PrereqHypergraph()
    h.add_edge("C", "e1", "AND", ["A", "B"])
    assert h.is_unlocked("C", {"A", "B"})
    assert not h.is_unlocked("C", {"A"})


def test_or_logic():
    h = PrereqHypergraph()
    h.add_edge("C", "e1", "OR", ["A", "B"])
    assert h.is_unlocked("C", {"A"})
    assert h.is_unlocked("C", {"B"})
    assert not h.is_unlocked("C", set())


def test_multiple_edges_are_or():
    h = PrereqHypergraph()
    h.add_edge("C", "e1", "AND", ["A", "B"])
    h.add_edge("C", "e2", "AND", ["X", "Y"])
    assert h.is_unlocked("C", {"A", "B"})
    assert h.is_unlocked("C", {"X", "Y"})
    assert not h.is_unlocked("C", {"A", "X"})
