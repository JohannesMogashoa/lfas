using System.Xml.Linq;

namespace LFAS.UnitTests;

public class ArchitectureReferenceTests
{
    public static TheoryData<string, string[]> ProjectReferences => new()
    {
        { "LFAS.AI", ["LFAS.Application"] },
        { "LFAS.Api", ["LFAS.Application", "LFAS.Infrastructure", "LFAS.ServiceDefaults"] },
        { "LFAS.AppHost", ["LFAS.Api", "LFAS.Web"] },
        { "LFAS.Application", ["LFAS.Domain"] },
        { "LFAS.Domain", ["LFAS.SharedKernel"] },
        { "LFAS.Infrastructure", ["LFAS.Application"] },
        { "LFAS.Reporting", ["LFAS.Application"] },
        { "LFAS.ServiceDefaults", [] },
        { "LFAS.SharedKernel", [] },
        { "LFAS.StatementParser", ["LFAS.Application"] },
        { "LFAS.Web", ["LFAS.ServiceDefaults", "LFAS.SharedKernel"] },
    };

    [Theory]
    [MemberData(nameof(ProjectReferences))]
    public void Projects_only_reference_allowed_dependencies(string projectName, string[] expectedReferences)
    {
        string projectPath = RepositoryPaths.ProjectFile(projectName);

        IReadOnlyCollection<string> actualReferences = ReadProjectReferences(projectPath);

        actualReferences.Should().BeEquivalentTo(expectedReferences);
    }

    [Fact]
    public void Domain_model_does_not_reference_outer_layers()
    {
        IReadOnlyCollection<string> references = ReadProjectReferences(RepositoryPaths.ProjectFile("LFAS.Domain"));

        references.Should().NotIntersectWith(["LFAS.Application", "LFAS.Infrastructure", "LFAS.Api", "LFAS.Web"]);
    }

    [Fact]
    public void Application_layer_does_not_reference_infrastructure_or_presentation()
    {
        IReadOnlyCollection<string> references = ReadProjectReferences(RepositoryPaths.ProjectFile("LFAS.Application"));

        references.Should().NotIntersectWith(["LFAS.Infrastructure", "LFAS.Api", "LFAS.Web"]);
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
        string normalizedPath = include.Replace('\\', Path.DirectorySeparatorChar);

        return Path.GetFileNameWithoutExtension(normalizedPath);
    }
}

internal static class RepositoryPaths
{
    public static string Root { get; } = FindRepositoryRoot();

    public static string ProjectFile(string projectName) =>
        Path.Combine(Root, "src", projectName, $"{projectName}.csproj");

    private static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);

        while (directory is not null)
        {
            if (File.Exists(Path.Combine(directory.FullName, "LFAS.slnx")))
            {
                return directory.FullName;
            }

            directory = directory.Parent;
        }

        throw new InvalidOperationException("Could not find repository root containing LFAS.slnx.");
    }
}
