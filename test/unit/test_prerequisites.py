from services.recognition.prerequisites import PrereqHypergraph


def test_and_logic_satisfied():
    g = PrereqHypergraph()
    g.add_edge("C", "e1", "AND", ["A", "B"])
    assert g.is_unlocked("C", {"A", "B"})
    assert not g.is_unlocked("C", {"A"})


def test_or_logic_satisfied():
    g = PrereqHypergraph()
    g.add_edge("C", "e1", "OR", ["A", "B"])
    assert g.is_unlocked("C", {"A"})
    assert g.is_unlocked("C", {"B"})
    assert not g.is_unlocked("C", set())


def test_multiple_edges_are_or():
    g = PrereqHypergraph()
    g.add_edge("C", "e1", "AND", ["A", "B"])
    g.add_edge("C", "e2", "AND", ["X", "Y"])
    assert g.is_unlocked("C", {"A", "B"})
    assert g.is_unlocked("C", {"X", "Y"})
    assert not g.is_unlocked("C", {"A", "X"})


def test_no_prereq_is_unlocked():
    g = PrereqHypergraph()
    assert g.is_unlocked("A", set())


def test_frontier_calculation():
    g = PrereqHypergraph()
    g.add_edge("CS-502", "e1", "AND", ["CS-201"])
    g.add_edge("CS-503", "e2", "AND", ["CS-502"])

    completed = {"CS-201"}
    frontier = g.frontier(["CS-501", "CS-502", "CS-503"], completed)
    assert "CS-501" in frontier  # No prereq
    assert "CS-502" in frontier  # Prereq CS-201 satisfied
    assert "CS-503" not in frontier  # Prereq CS-502 not satisfied
