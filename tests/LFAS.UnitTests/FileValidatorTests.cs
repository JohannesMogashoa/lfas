using System.Text;
using LFAS.SharedKernel.Validators;

namespace LFAS.UnitTests;

public class FileValidatorTests
{
    [Fact]
    public async Task ValidatePdfAsync_returns_valid_result_for_unencrypted_pdf_and_restores_stream_position()
    {
        using MemoryStream stream = CreatePdfStream(encrypted: false);
        stream.Position = 11;

        PdfValidationResult result = await FileValidator.ValidatePdfAsync(stream);

        result.IsValid.Should().BeTrue();
        result.IsEncrypted.Should().BeFalse();
        result.Message.Should().Be("PDF is valid and completely unencrypted.");
        stream.Position.Should().Be(11);
    }

    [Fact]
    public async Task ValidatePdfAsync_rejects_streams_with_invalid_pdf_signature()
    {
        using MemoryStream stream = new(Encoding.ASCII.GetBytes("NOTPDF-1234567890"));

        PdfValidationResult result = await FileValidator.ValidatePdfAsync(stream);

        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Invalid PDF signature magic bytes.");
    }

    [Fact]
    public async Task ValidatePdfAsync_rejects_truncated_pdfs()
    {
        using MemoryStream stream = new(Encoding.ASCII.GetBytes("%PDF-1.4\ntruncated"));

        PdfValidationResult result = await FileValidator.ValidatePdfAsync(stream);

        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Truncated or broken PDF structure (missing %%EOF).");
    }

    [Fact]
    public async Task ValidatePdfAsync_rejects_encrypted_pdfs_with_clear_message()
    {
        using MemoryStream stream = CreatePdfStream(encrypted: true);

        PdfValidationResult result = await FileValidator.ValidatePdfAsync(stream);

        result.IsValid.Should().BeTrue();
        result.IsEncrypted.Should().BeTrue();
        result.Message.Should().Be("Valid PDF structure detected, but the file is password encrypted.");
    }

    [Fact]
    public async Task ValidatePdfAsync_rejects_non_seekable_streams()
    {
        await using Stream stream = new NonSeekableStream(CreatePdfBytes(encrypted: false));

        PdfValidationResult result = await FileValidator.ValidatePdfAsync(stream);

        result.IsValid.Should().BeFalse();
        result.Message.Should().Be("Stream must be seekable to validate PDF structure.");
    }

    private static MemoryStream CreatePdfStream(bool encrypted) => new(CreatePdfBytes(encrypted));

    private static byte[] CreatePdfBytes(bool encrypted)
    {
        string encryptedSection = encrypted ? "\n2 0 obj\n<< /Encrypt << /Filter /Standard >> >>\nendobj" : string.Empty;
        string pdf = $"""
                      %PDF-1.4
                      1 0 obj
                      << /Type /Catalog >>
                      endobj{encryptedSection}
                      xref
                      0 1
                      0000000000 65535 f 
                      trailer
                      << /Root 1 0 R >>
                      startxref
                      9
                      %%EOF
                      """;

        return Encoding.ASCII.GetBytes(pdf);
    }

    private sealed class NonSeekableStream : Stream
    {
        private readonly MemoryStream _inner;

        public NonSeekableStream(byte[] buffer)
        {
            _inner = new MemoryStream(buffer, writable: false);
        }

        public override bool CanRead => true;
        public override bool CanSeek => false;
        public override bool CanWrite => false;
        public override long Length => throw new NotSupportedException();
        public override long Position
        {
            get => throw new NotSupportedException();
            set => throw new NotSupportedException();
        }

        public override void Flush()
        {
        }

        public override int Read(byte[] buffer, int offset, int count) => _inner.Read(buffer, offset, count);

        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        public override ValueTask DisposeAsync() => _inner.DisposeAsync();

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _inner.Dispose();
            }

            base.Dispose(disposing);
        }

        public override Task<int> ReadAsync(byte[] buffer, int offset, int count, CancellationToken cancellationToken) =>
            _inner.ReadAsync(buffer, offset, count, cancellationToken);
    }
}
