using System.Text;
using System.Text.Json;
using LFAS.Application.Abstractions.Time;
using LFAS.Application.Statements.Upload;
using LFAS.Domain.Entities;
using LFAS.Domain.Repositories;
using LFAS.SharedKernel;
using Microsoft.Extensions.Logging;

namespace LFAS.UnitTests;

public class UploadStatementServiceTests
{
    [Fact]
    public async Task HandleAsync_creates_one_audit_event_for_an_accepted_upload()
    {
        var statementRepository = Substitute.For<IStatementProcessingJobRepository>();
        statementRepository.CreateAsync(Arg.Any<StatementProcessingJob>(), Arg.Any<CancellationToken>())
            .Returns(Guid.Parse("11111111-1111-1111-1111-111111111111"));

        var auditRepository = new InMemoryUploadAuditTrailRepository();
        var clock = Substitute.For<IClock>();
        clock.UtcNow.Returns(new DateTimeOffset(2026, 6, 10, 8, 30, 0, TimeSpan.Zero));

        var service = new UploadStatementService(
            statementRepository,
            auditRepository,
            clock,
            new TestLogger<UploadStatementService>());

        UploadStatementDto dto = CreateDto(
            correlationId: CorrelationId.From("22222222-2222-2222-2222-222222222222"),
            uploadedByUserId: Guid.Parse("33333333-3333-3333-3333-333333333333"),
            sourceIpAddress: "203.0.113.42");

        Result<UploadStatementResult> result = await service.HandleAsync(dto);

        result.IsSuccessful.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.JobId.Should().Be(Guid.Parse("11111111-1111-1111-1111-111111111111"));
        result.Data.Status.Should().Be(StatementJobStatus.Queued);

        auditRepository.Events.Should().ContainSingle();

        UploadAuditEvent auditEvent = auditRepository.Events.Single();
        auditEvent.UploadedAt.Should().Be(clock.UtcNow);
        auditEvent.UploadedByUserId.Should().Be(Guid.Parse("33333333-3333-3333-3333-333333333333"));
        auditEvent.SourceIpAddress.Should().Be("203.0.113.42");
        auditEvent.CorrelationId.Should().Be(dto.CorrelationId);
        auditEvent.UploadId.Should().Be(result.Data.StatementId);
        auditEvent.JobId.Should().Be(result.Data.JobId);
        auditEvent.Should().NotBeNull();
    }

    [Fact]
    public async Task HandleAsync_omits_optional_metadata_when_user_and_source_ip_are_missing()
    {
        var statementRepository = Substitute.For<IStatementProcessingJobRepository>();
        statementRepository.CreateAsync(Arg.Any<StatementProcessingJob>(), Arg.Any<CancellationToken>())
            .Returns(Guid.NewGuid());

        var auditRepository = new InMemoryUploadAuditTrailRepository();
        var clock = Substitute.For<IClock>();
        clock.UtcNow.Returns(new DateTimeOffset(2026, 6, 10, 8, 30, 0, TimeSpan.Zero));

        var service = new UploadStatementService(
            statementRepository,
            auditRepository,
            clock,
            new TestLogger<UploadStatementService>());

        UploadStatementDto dto = CreateDto(
            correlationId: CorrelationId.New(),
            uploadedByUserId: null,
            sourceIpAddress: null);

        await service.HandleAsync(dto);

        UploadAuditEvent auditEvent = auditRepository.Events.Single();
        auditEvent.UploadedByUserId.Should().BeNull();
        auditEvent.SourceIpAddress.Should().BeNull();
    }

    [Fact]
    public async Task HandleAsync_sanitizes_sensitive_or_overlong_optional_metadata()
    {
        var statementRepository = Substitute.For<IStatementProcessingJobRepository>();
        statementRepository.CreateAsync(Arg.Any<StatementProcessingJob>(), Arg.Any<CancellationToken>())
            .Returns(Guid.NewGuid());

        var auditRepository = new InMemoryUploadAuditTrailRepository();
        var clock = Substitute.For<IClock>();
        clock.UtcNow.Returns(new DateTimeOffset(2026, 6, 10, 8, 30, 0, TimeSpan.Zero));

        var service = new UploadStatementService(
            statementRepository,
            auditRepository,
            clock,
            new TestLogger<UploadStatementService>());

        UploadStatementDto dto = CreateDto(
            correlationId: CorrelationId.New(),
            uploadedByUserId: null,
            sourceIpAddress: "   203.0.113.42-01234567890123456789012345678901234567890   ");

        await service.HandleAsync(dto);

        UploadAuditEvent auditEvent = auditRepository.Events.Single();
        auditEvent.SourceIpAddress.Should().StartWith("203.0.113.42");
        auditEvent.SourceIpAddress.Should().HaveLength(45);
        auditEvent.SourceIpAddress.Should().NotStartWith(" ");
    }

    [Fact]
    public async Task HandleAsync_does_not_include_statement_content_in_audit_payload()
    {
        var statementRepository = Substitute.For<IStatementProcessingJobRepository>();
        statementRepository.CreateAsync(Arg.Any<StatementProcessingJob>(), Arg.Any<CancellationToken>())
            .Returns(Guid.NewGuid());

        var auditRepository = new InMemoryUploadAuditTrailRepository();
        var clock = Substitute.For<IClock>();
        clock.UtcNow.Returns(new DateTimeOffset(2026, 6, 10, 8, 30, 0, TimeSpan.Zero));

        var service = new UploadStatementService(
            statementRepository,
            auditRepository,
            clock,
            new TestLogger<UploadStatementService>());

        string embeddedStatementContent = "ACCOUNT-1234-BALANCE-9999";
        UploadStatementDto dto = CreateDto(
            correlationId: CorrelationId.New(),
            uploadedByUserId: null,
            sourceIpAddress: null,
            embeddedStatementContent: embeddedStatementContent);

        await service.HandleAsync(dto);

        UploadAuditEvent auditEvent = auditRepository.Events.Single();
        string serializedAuditEvent = JsonSerializer.Serialize(auditEvent);

        serializedAuditEvent.Should().NotContain(embeddedStatementContent);
        serializedAuditEvent.Should().NotContain("statement.pdf");
    }

    private static UploadStatementDto CreateDto(
        CorrelationId correlationId,
        Guid? uploadedByUserId,
        string? sourceIpAddress,
        string? embeddedStatementContent = null)
    {
        string pdf = string.IsNullOrWhiteSpace(embeddedStatementContent)
            ? """
              %PDF-1.4
              1 0 obj
              << /Type /Catalog >>
              endobj
              xref
              0 1
              0000000000 65535 f 
              trailer
              << /Root 1 0 R >>
              startxref
              9
              %%EOF
              """
            : $"""
               %PDF-1.4
               1 0 obj
               << /Type /Catalog >>
               endobj
               {embeddedStatementContent}
               xref
               0 1
               0000000000 65535 f 
               trailer
               << /Root 1 0 R >>
               startxref
               9
               %%EOF
               """;

        byte[] pdfBytes = Encoding.ASCII.GetBytes(pdf);

        return new UploadStatementDto(
            new MemoryStream(pdfBytes),
            "statement.pdf",
            "application/pdf",
            pdfBytes.Length,
            correlationId,
            uploadedByUserId,
            sourceIpAddress);
    }

    private sealed class InMemoryUploadAuditTrailRepository : IUploadAuditTrailRepository
    {
        public List<UploadAuditEvent> Events { get; } = new();

        public Task<Guid> CreateAsync(UploadAuditEvent auditEvent, CancellationToken cancellationToken = default)
        {
            Events.Add(auditEvent);
            return Task.FromResult(auditEvent.Id);
        }
    }

    private sealed class TestLogger<T> : ILogger<T>
    {
        private sealed class NoopScope : IDisposable
        {
            public void Dispose()
            {
            }
        }

        public IDisposable BeginScope<TState>(TState state) where TState : notnull => new NoopScope();

        public bool IsEnabled(LogLevel logLevel) => false;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
        }
    }
}
