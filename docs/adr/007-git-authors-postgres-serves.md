# ADR-007: Git Authors, Postgres Serves

### Status
Accepted

### Context
Curriculum and institutional policies need version control, branching, PR review workflows, and diff inspection by academic committees. However, git repositories cannot provide transactional, low-latency relational queries needed during active runtime decision loops.

### Decision
- **Git** is the Authoring System of Record: Institutions maintain syllabi, prerequisite definitions, and credit policies as YAML/JSON in Git with GitOps pull requests.
- **Postgres** is the Runtime Serving Truth: A CI/CD deployment pipeline validates YAML schemas, parses data, and loads versioned, immutable records into PostgreSQL `version_registry`, `curricula`, `courses`, and `prerequisites`.

### Consequences
- Clean separation between policy authoring lifecycle and low-latency decision execution.
- Runtime reads only verified immutable versions in Postgres with zero runtime Git dependency.

### Verification
- `services/policy/loader.py` retrieves policies by immutable version string, referencing `ruleset_commit`.
