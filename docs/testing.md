# Testing

LFAS uses xUnit for test execution, FluentAssertions for readable assertions, and
NSubstitute for mocks or substitutes when a unit test needs a collaborator.

## Unit Test Naming

Use business-readable names that describe the subject, scenario, and expected
outcome.

- Test classes use `{Subject}Tests`.
- Test methods use `{Subject}_{Scenario}_{ExpectedOutcome}`.
- Names must be deterministic and privacy-safe.
- Avoid raw statement data, account numbers, identity numbers, phone numbers,
  emails, or references in test names.

## Running Tests

Run the full suite from the repository root:

```bash
dotnet test LFAS.slnx
```
