from services.recognition.bitset_prerequisites import BitsetHypergraph


def test_bitset_and_logic():
    bg = BitsetHypergraph(num_courses=64)
    bg.add_and_prereqs("CS-301", ["CS-101", "CS-201"])

    cm_empty = bg.create_completed_mask(set())
    cm_partial = bg.create_completed_mask({"CS-101"})
    cm_full = bg.create_completed_mask({"CS-101", "CS-201"})

    c_idx = bg.get_or_create_idx("CS-301")
    assert not bg.is_unlocked(c_idx, cm_empty)
    assert not bg.is_unlocked(c_idx, cm_partial)
    assert bg.is_unlocked(c_idx, cm_full)


def test_bitset_or_logic():
    bg = BitsetHypergraph(num_courses=64)
    bg.add_or_prereq_group("CS-302", ["CS-101"])
    bg.add_or_prereq_group("CS-302", ["CS-102"])

    cm_none = bg.create_completed_mask(set())
    cm_1 = bg.create_completed_mask({"CS-101"})
    cm_2 = bg.create_completed_mask({"CS-102"})

    c_idx = bg.get_or_create_idx("CS-302")
    assert not bg.is_unlocked(c_idx, cm_none)
    assert bg.is_unlocked(c_idx, cm_1)
    assert bg.is_unlocked(c_idx, cm_2)


def test_bitset_frontier_and_delta():
    bg = BitsetHypergraph(num_courses=64)
    bg.add_and_prereqs("CS-201", ["CS-101"])
    bg.add_and_prereqs("CS-301", ["CS-201"])

    # Initial state: only CS-101 completed
    initial_completed = {"CS-101"}
    target = ["CS-101", "CS-201", "CS-301"]
    frontier = bg.compute_frontier(target, initial_completed)

    assert "CS-101" in frontier
    assert "CS-201" in frontier
    assert "CS-301" not in frontier

    # Incremental completion of CS-201
    cm = bg.create_completed_mask(initial_completed)
    delta = bg.delta_frontier("CS-201", cm, frontier)
    assert "CS-301" in delta
