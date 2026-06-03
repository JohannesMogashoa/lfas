using System.Xml.Linq;

namespace LFAS.IntegrationTests;

public class InfrastructureReferenceTests
{
    [Fact]
    public void Solution_includes_all_runtime_and_test_projects()
    {
        var solution = File.ReadAllText(RepositoryPaths.File("LFAS.slnx"));

        string[] expectedProjects =
        [
            "src/LFAS.AppHost/LFAS.AppHost.csproj",
            "src/LFAS.AI/LFAS.AI.csproj",
            "src/LFAS.Api/LFAS.Api.csproj",
            "src/LFAS.Application/LFAS.Application.csproj",
            "src/LFAS.Domain/LFAS.Domain.csproj",
            "src/LFAS.Infrastructure/LFAS.Infrastructure.csproj",
            "src/LFAS.Reporting/LFAS.Reporting.csproj",
            "src/LFAS.ServiceDefaults/LFAS.ServiceDefaults.csproj",
            "src/LFAS.SharedKernel/LFAS.SharedKernel.csproj",
            "src/LFAS.StatementParser/LFAS.StatementParser.csproj",
            "src/LFAS.Web/LFAS.Web.csproj",
            "tests/LFAS.IntegrationTests/LFAS.IntegrationTests.csproj",
            "tests/LFAS.UnitTests/LFAS.UnitTests.csproj"
        ];

        foreach (var project in expectedProjects)
        {
            Assert.Contains(project, solution);
        }
    }

    [Fact]
    public void Aspire_apphost_references_the_runnable_projects()
    {
        var references = ReadProjectReferences(RepositoryPaths.ProjectFile("LFAS.AppHost"));

        Assert.Equal(["LFAS.Api", "LFAS.Web"], references.Order());
    }

    [Fact]
    public void Aspire_apphost_orchestrates_database_api_and_web()
    {
        var appHostProgram = File.ReadAllText(RepositoryPaths.File("src", "LFAS.AppHost", "Program.cs"));

        Assert.Contains(".AddPostgres(\"postgres\")", appHostProgram);
        Assert.Contains(".WithPgAdmin()", appHostProgram);
        Assert.Contains("builder.Configuration[\"LFAS:Postgres:Database\"] ?? \"lfas\"", appHostProgram);
        Assert.Contains("postgres.AddDatabase(\"lfasdb\", databaseName)", appHostProgram);
        Assert.Contains(".AddProject<Projects.LFAS_Api>(\"api\")", appHostProgram);
        Assert.Contains(".AddProject<Projects.LFAS_Web>(\"web\")", appHostProgram);
        Assert.Contains(".WithReference(database)", appHostProgram);
        Assert.Contains(".WithReference(api)", appHostProgram);
    }

    [Theory]
    [InlineData("LFAS.Api")]
    [InlineData("LFAS.Web")]
    public void Runnable_projects_use_service_defaults(string projectName)
    {
        var references = ReadProjectReferences(RepositoryPaths.ProjectFile(projectName));
        var program = File.ReadAllText(RepositoryPaths.File("src", projectName, "Program.cs"));

        Assert.Contains("LFAS.ServiceDefaults", references);
        Assert.Contains("builder.AddServiceDefaults();", program);
        Assert.Contains("app.MapDefaultEndpoints();", program);
    }

    private static IReadOnlyCollection<string> ReadProjectReferences(string projectPath)
    {
        var document = XDocument.Load(projectPath);

        return document
            .Descendants("ProjectReference")
            .Select(reference => reference.Attribute("Include")?.Value)
            .OfType<string>()
            .Where(include => !string.IsNullOrWhiteSpace(include))
            .Select(ProjectNameFromReference)
            .ToArray();
    }

    private static string ProjectNameFromReference(string include)
    {
        var normalizedPath = include.Replace('\\', Path.DirectorySeparatorChar);

        return Path.GetFileNameWithoutExtension(normalizedPath);
    }
}

internal static class RepositoryPaths
{
    public static string Root { get; } = FindRepositoryRoot();

    public static string File(params string[] segments) =>
        Path.Combine([Root, .. segments]);

    public static string ProjectFile(string projectName) =>
        File("src", projectName, $"{projectName}.csproj");

    private static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);

        while (directory is not null)
        {
            if (System.IO.File.Exists(Path.Combine(directory.FullName, "LFAS.slnx")))
            {
                return directory.FullName;
            }

            directory = directory.Parent;
        }

        throw new InvalidOperationException("Could not find repository root containing LFAS.slnx.");
    }
}
