from services.matching.minhash_consensus import MinHashSignature, consensus_fast_minhash
from services.schemas import MatchResult


def make_match(src: str, tgt: str, coverage: float) -> MatchResult:
    return MatchResult(
        source_course_id=src,
        target_course_id=tgt,
        semantic_score=coverage,
        outcome_coverage=coverage,
        prerequisite_status=True,
        assessment_match=1.0,
        credit_compatibility=True,
        domain_alignment=True,
        policy_eligibility=True,
        evidence_quality=0.9,
    )


def test_minhash_signature_identical():
    hasher = MinHashSignature(num_hashes=32)
    s1 = {"A:DIRECT", "B:BRIDGE", "C:MISSING"}
    s2 = {"A:DIRECT", "B:BRIDGE", "C:MISSING"}

    sig1 = hasher.compute(s1)
    sig2 = hasher.compute(s2)
    assert MinHashSignature.jaccard_similarity(sig1, sig2) == 1.0


def test_consensus_fast_agreement():
    m1 = [make_match("C1", "T1", 0.95), make_match("C2", "T2", 0.70)]
    m2 = [make_match("C1", "T1", 0.95), make_match("C2", "T2", 0.70)]

    agreement = consensus_fast_minhash([m1, m2], policy={})
    assert agreement == 1.0


def test_consensus_fast_disagreement():
    m1 = [make_match("C1", "T1", 0.95)]  # DIRECT
    m2 = [make_match("C1", "T1", 0.70)]  # BRIDGE

    agreement = consensus_fast_minhash([m1, m2], policy={})
    assert agreement == 0.0
