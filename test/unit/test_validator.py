from services.solver.validator import PathwayValidator
from services.schemas import Pathway, TermPlan, PathwayMode
from services.recognition.prerequisites import PrereqHypergraph


def test_validator_valid_pathway():
    validator = PathwayValidator(min_credits_per_term=8.0, max_credits_per_term=20.0, max_total_terms=6)
    hypergraph = PrereqHypergraph()
    hypergraph.add_edge("CS-201", "e1", "AND", ["CS-101"])

    pathway = Pathway(
        mode=PathwayMode.BALANCED,
        terms=2,
        bridge_burden=0.0,
        terms_plan=[
            TermPlan(term_number=1, courses=["CS-101", "CS-102"], bridges=[]),
            TermPlan(term_number=2, courses=["CS-201"], bridges=[]),
        ],
    )

    report = validator.validate_pathway(
        pathway=pathway,
        required_target_courses={"CS-101", "CS-102", "CS-201"},
        initially_completed_courses=set(),
        hypergraph=hypergraph,
        course_credits_map={"CS-101": 4.0, "CS-102": 4.0, "CS-201": 4.0},
    )

    assert report.is_valid
    assert len(report.errors) == 0


def test_validator_detects_prerequisite_violation():
    validator = PathwayValidator()
    hypergraph = PrereqHypergraph()
    hypergraph.add_edge("CS-201", "e1", "AND", ["CS-101"])

    # Invalid: CS-201 scheduled in Term 1 before CS-101
    pathway = Pathway(
        mode=PathwayMode.BALANCED,
        terms=2,
        bridge_burden=0.0,
        terms_plan=[
            TermPlan(term_number=1, courses=["CS-201"], bridges=[]),
            TermPlan(term_number=2, courses=["CS-101"], bridges=[]),
        ],
    )

    report = validator.validate_pathway(
        pathway=pathway,
        required_target_courses={"CS-101", "CS-201"},
        initially_completed_courses=set(),
        hypergraph=hypergraph,
        course_credits_map={"CS-101": 4.0, "CS-201": 4.0},
    )

    assert not report.is_valid
    assert any("Prerequisite unsatisfied" in err for err in report.errors)


def test_validator_detects_overloaded_credits():
    validator = PathwayValidator(max_credits_per_term=12.0)
    hypergraph = PrereqHypergraph()

    pathway = Pathway(
        mode=PathwayMode.FASTEST,
        terms=1,
        bridge_burden=0.0,
        terms_plan=[
            TermPlan(term_number=1, courses=["C1", "C2", "C3", "C4"], bridges=[]),
        ],
    )

    report = validator.validate_pathway(
        pathway=pathway,
        required_target_courses={"C1", "C2", "C3", "C4"},
        initially_completed_courses=set(),
        hypergraph=hypergraph,
        course_credits_map={"C1": 4.0, "C2": 4.0, "C3": 4.0, "C4": 4.0},
    )

    assert not report.is_valid
    assert any("exceed maximum" in err for err in report.errors)
