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
        { "LFAS.Web", ["LFAS.ServiceDefaults"] }
    };

    [Theory]
    [MemberData(nameof(ProjectReferences))]
    public void Projects_only_reference_allowed_dependencies(string projectName, string[] expectedReferences)
    {
        var projectPath = RepositoryPaths.ProjectFile(projectName);

        var actualReferences = ReadProjectReferences(projectPath);

        Assert.Equal(expectedReferences.Order(), actualReferences.Order());
    }

    [Fact]
    public void Domain_model_does_not_reference_outer_layers()
    {
        var references = ReadProjectReferences(RepositoryPaths.ProjectFile("LFAS.Domain"));

        Assert.DoesNotContain("LFAS.Application", references);
        Assert.DoesNotContain("LFAS.Infrastructure", references);
        Assert.DoesNotContain("LFAS.Api", references);
        Assert.DoesNotContain("LFAS.Web", references);
    }

    [Fact]
    public void Application_layer_does_not_reference_infrastructure_or_presentation()
    {
        var references = ReadProjectReferences(RepositoryPaths.ProjectFile("LFAS.Application"));

        Assert.DoesNotContain("LFAS.Infrastructure", references);
        Assert.DoesNotContain("LFAS.Api", references);
        Assert.DoesNotContain("LFAS.Web", references);
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
