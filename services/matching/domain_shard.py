# services/matching/domain_shard.py
"""
Rule-based domain classification.

Reduces the candidate search space by sharding courses into domains.
A CS course should never match a Humanities course, regardless of
text similarity. Cross-domain matches are INTENTIONALLY blocked
here - the caller can override if needed.

Owner: Member 2
"""
from __future__ import annotations

from enum import Enum


class Domain(str, Enum):
    CS = "computer_science"
    MATH = "mathematics"
    PHYSICS = "physics"
    CHEMISTRY = "chemistry"
    BIO = "biology"
    HUMANITIES = "humanities"
    COMMERCE = "commerce"
    ENGINEERING = "engineering"
    OTHER = "other"


DOMAIN_KEYWORDS: dict[Domain, tuple[str, ...]] = {
    Domain.CS: (
        "algorithm", "database", "software", "programming", "compiler",
        "network", "operating system", "machine learning", "artificial intelligence",
        "data structure", "computer", "sql", "cloud", "distributed system",
        "web", "api", "cybersecurity", "cryptography",
    ),
    Domain.MATH: (
        "algebra", "calculus", "statistics", "probability", "discrete math",
        "geometry", "topology", "linear algebra", "number theory",
        "differential equation", "mathematical", "theorem", "proof",
    ),
    Domain.PHYSICS: (
        "mechanics", "electromagnetism", "thermodynamics", "quantum",
        "optics", "relativity", "astrophysics", "solid state", "physics",
    ),
    Domain.CHEMISTRY: (
        "organic chemistry", "inorganic chemistry", "physical chemistry",
        "analytical chemistry", "chemical", "molecule", "reaction",
        "stoichiometry", "chemistry",
    ),
    Domain.BIO: (
        "biology", "genetics", "ecology", "molecular biology", "cell biology",
        "botany", "zoology", "microbiology", "biochemistry", "evolution",
    ),
    Domain.HUMANITIES: (
        "history", "philosophy", "literature", "linguistics", "sociology",
        "anthropology", "political science", "psychology", "arts",
        "cultural studies", "ethics", "religion", "humanities",
    ),
    Domain.COMMERCE: (
        "accounting", "finance", "economics", "marketing", "management",
        "business", "commerce", "entrepreneurship", "supply chain",
        "organisational behaviour",
    ),
    Domain.ENGINEERING: (
        "mechanical engineering", "civil engineering", "electrical engineering",
        "electronics", "aerospace", "automotive", "manufacturing", "robotics",
        "control system", "signal processing", "engineering",
    ),
}


def classify_domain(
    course_name: str,
    outcome_texts: list[str] | None = None,
) -> Domain:
    """
    Classify a course into a Domain via keyword scoring.

    Args:
        course_name: name of the course (e.g. "Data Structures")
        outcome_texts: optional list of learning outcome strings

    Returns:
        Domain. Returns Domain.OTHER if no keyword matched.
    """
    if not isinstance(course_name, str):
        course_name = ""
    parts = [course_name.lower()]
    if outcome_texts:
        for o in outcome_texts:
            if isinstance(o, str):
                parts.append(o.lower())
    haystack = " ".join(parts)

    scores: dict[Domain, int] = {d: 0 for d in Domain}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        for kw in keywords:
            if kw in haystack:
                scores[domain] += 1

    # pick highest; if tie, return the first domain in enum order
    best_domain = max(scores, key=lambda d: scores[d])
    if scores[best_domain] == 0:
        return Domain.OTHER
    return best_domain


def is_same_domain(
    domain_a: Domain,
    domain_b: Domain,
) -> bool:
    """
    Domain alignment check. OTHER matches only OTHER.
    """
    return domain_a == domain_b
