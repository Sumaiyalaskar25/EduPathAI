from services.cache.bloom_filter import BloomFilter


def test_bloom_filter_membership():
    bf = BloomFilter(expected_items=100, false_positive_rate=0.01)

    bf.add("IIT-Bombay:BTech-CSE:2026-v1")
    bf.add("IIT-Delhi:BTech-EE:2025-v2")

    # Positive matches
    assert bf.might_contain("IIT-Bombay:BTech-CSE:2026-v1")
    assert bf.might_contain("IIT-Delhi:BTech-EE:2025-v2")

    # Definite negative matches
    assert not bf.might_contain("RandomUniv:MCA:1999")
    assert not bf.might_contain("NonExistent:Programme:v0")
