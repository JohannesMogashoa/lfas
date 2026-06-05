#!/usr/bin/env bash
set -euo pipefail

SOLUTION_NAME="${1:-LFAS}"

dotnet new sln -n "$SOLUTION_NAME"

mkdir -p src tests

dotnet new classlib -n "$SOLUTION_NAME.Domain" -o "src/$SOLUTION_NAME.Domain"
dotnet new classlib -n "$SOLUTION_NAME.Application" -o "src/$SOLUTION_NAME.Application"
dotnet new classlib -n "$SOLUTION_NAME.Infrastructure" -o "src/$SOLUTION_NAME.Infrastructure"
dotnet new webapi -n "$SOLUTION_NAME.Api" -o "src/$SOLUTION_NAME.Api"
dotnet new classlib -n "$SOLUTION_NAME.StatementParser" -o "src/$SOLUTION_NAME.StatementParser"
dotnet new classlib -n "$SOLUTION_NAME.Reporting" -o "src/$SOLUTION_NAME.Reporting"
dotnet new classlib -n "$SOLUTION_NAME.AI" -o "src/$SOLUTION_NAME.AI"
dotnet new classlib -n "$SOLUTION_NAME.SharedKernel" -o "src/$SOLUTION_NAME.SharedKernel"

dotnet new xunit -n "$SOLUTION_NAME.UnitTests" -o "tests/$SOLUTION_NAME.UnitTests"
dotnet new xunit -n "$SOLUTION_NAME.IntegrationTests" -o "tests/$SOLUTION_NAME.IntegrationTests"

dotnet sln add src/**/*.csproj tests/**/*.csproj

dotnet add "src/$SOLUTION_NAME.Domain/$SOLUTION_NAME.Domain.csproj" reference "src/$SOLUTION_NAME.SharedKernel/$SOLUTION_NAME.SharedKernel.csproj"
dotnet add "src/$SOLUTION_NAME.Application/$SOLUTION_NAME.Application.csproj" reference "src/$SOLUTION_NAME.Domain/$SOLUTION_NAME.Domain.csproj"
dotnet add "src/$SOLUTION_NAME.Infrastructure/$SOLUTION_NAME.Infrastructure.csproj" reference "src/$SOLUTION_NAME.Application/$SOLUTION_NAME.Application.csproj"
dotnet add "src/$SOLUTION_NAME.Api/$SOLUTION_NAME.Api.csproj" reference "src/$SOLUTION_NAME.Application/$SOLUTION_NAME.Application.csproj" "src/$SOLUTION_NAME.Infrastructure/$SOLUTION_NAME.Infrastructure.csproj"
dotnet add "src/$SOLUTION_NAME.StatementParser/$SOLUTION_NAME.StatementParser.csproj" reference "src/$SOLUTION_NAME.Application/$SOLUTION_NAME.Application.csproj"
dotnet add "src/$SOLUTION_NAME.Reporting/$SOLUTION_NAME.Reporting.csproj" reference "src/$SOLUTION_NAME.Application/$SOLUTION_NAME.Application.csproj"
dotnet add "src/$SOLUTION_NAME.AI/$SOLUTION_NAME.AI.csproj" reference "src/$SOLUTION_NAME.Application/$SOLUTION_NAME.Application.csproj"

dotnet build

echo "Solution scaffolded."
