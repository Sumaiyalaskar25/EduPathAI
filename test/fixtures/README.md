# Fixtures

## Philosophy

Mocks prove wiring. Fixtures prove logic.

Every fixture here is a REAL syllabus excerpt with a GOLD-LABELLED
expected match. The integration test runs the ACTUAL recognizer
against these and asserts the recognizer produces the labels.

## Fixtures

### fixture_001: IIT-Bombay CSE 2024 → IIT-Bombay CSE 2026
- Source: DBMS (2024 syllabus)
- Target: Database Systems (2026 syllabus)
- Expected: DIRECT (outcome coverage 0.92)
- Gold label: tests/fixtures/fixture_001/gold.json

### fixture_002: State University CSE → IIT-Bombay CSE
- Source: Data Structures (State Univ)
- Target: Advanced Algorithms (IIT-B)
- Expected: BRIDGE (outcome coverage 0.68, missing "amortized analysis")
- Gold label: tests/fixtures/fixture_002/gold.json

### fixture_003: BCA → B.Tech CSE
- Source: Programming in C (BCA)
- Target: Programming & Data Structures (B.Tech)
- Expected: BRIDGE (theory matches, lab missing)
- Gold label: tests/fixtures/fixture_003/gold.json
