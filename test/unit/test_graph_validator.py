import pytest
from services.recognition.graph_validator import validate_curriculum_cycles, topological_sort


def test_no_cycles_valid_dag():
    # CS-101 -> CS-201 -> CS-301
    graph = {
        "CS-101": ["CS-201"],
        "CS-201": ["CS-301"],
        "CS-301": [],
    }
    cycles = validate_curriculum_cycles(graph)
    assert len(cycles) == 0

    order = topological_sort(graph)
    assert order.index("CS-101") < order.index("CS-201")
    assert order.index("CS-201") < order.index("CS-301")


def test_cycle_detection():
    # CS-101 -> CS-201 -> CS-301 -> CS-101
    graph = {
        "CS-101": ["CS-201"],
        "CS-201": ["CS-301"],
        "CS-301": ["CS-101"],
    }
    cycles = validate_curriculum_cycles(graph)
    assert len(cycles) == 1
    assert set(cycles[0]) == {"CS-101", "CS-201", "CS-301"}

    with pytest.raises(ValueError, match="cycles"):
        topological_sort(graph)


def test_self_loop_cycle():
    graph = {
        "CS-101": ["CS-101"],
    }
    cycles = validate_curriculum_cycles(graph)
    assert len(cycles) == 1
