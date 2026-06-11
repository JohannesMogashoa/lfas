using System.Text;

namespace LFAS.SharedKernel.Validators;

public static class FileValidator
{
    // Exact 5-byte sequence for %PDF-
    private static readonly byte[] PdfMagicBytes = "%PDF-"u8.ToArray();

    // Exact sequence for %%EOF
    private static readonly byte[] PdfFooterBytes = "%%EOF"u8.ToArray();

    private static readonly byte[] PdfEncryptMarker = Encoding.ASCII.GetBytes("/Encrypt");

    /// <summary>
    /// Checks the structural integrity of the PDF and scans for password encryption.
    /// </summary>
    public static async Task<PdfValidationResult> ValidatePdfAsync(Stream stream)
    {
        var result = new PdfValidationResult();
        long originalPosition = stream.CanSeek ? stream.Position : 0;

        try
        {
            if (!stream.CanSeek)
            {
                result.Message = "Stream must be seekable to validate PDF structure.";
                return result;
            }

            if (stream.Length < (PdfMagicBytes.Length + PdfFooterBytes.Length))
            {
                result.Message = "File is empty or too small to be a valid PDF.";
                return result;
            }

            // 1. Validate Header
            stream.Position = 0;
            byte[] header = new byte[PdfMagicBytes.Length];
            int headerBytesRead = await stream.ReadAsync(header, 0, header.Length);

            if (headerBytesRead < header.Length || !MatchSequence(header, PdfMagicBytes))
            {
                result.Message = "Invalid PDF signature magic bytes.";
                return result;
            }

            // 2. Validate Footer
            int footerWindowSize = (int)Math.Min(32, stream.Length);
            byte[] footerBuffer = new byte[footerWindowSize];
            stream.Seek(-footerWindowSize, SeekOrigin.End);
            await stream.ReadExactlyAsync(footerBuffer, 0, footerBuffer.Length);

            if (!ContainsSequence(footerBuffer, PdfFooterBytes))
            {
                result.Message = "Truncated or broken PDF structure (missing %%EOF).";
                return result;
            }

            // 3. Scan for Password Encryption
            // We read the file in chunks to find the "/Encrypt" object identifier
            stream.Position = 0;
            byte[] buffer = new byte[4096];
            int bytesRead;

            while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
            {
                // If the buffer window size is less than 4096, pass the exact size slice
                byte[] activeBuffer = bytesRead == buffer.Length ? buffer : buffer.Take(bytesRead).ToArray();

                if (!ContainsSequence(activeBuffer, PdfEncryptMarker)) continue;

                result.IsValid = true;
                result.IsEncrypted = true;
                result.Message = "Valid PDF structure detected, but the file is password encrypted.";
                return result;
            }

            result.IsValid = true;
            result.Message = "PDF is valid and completely unencrypted.";
            return result;
        }
        finally
        {
            if (stream.CanSeek)
            {
                stream.Position = originalPosition;
            }
        }
    }

    private static bool MatchSequence(byte[] source, byte[] pattern)
    {
        return !pattern.Where((t, i) => source[i] != t).Any();
    }

    /// <summary>
    /// Helper algorithm to locate a byte pattern inside a buffer windows
    /// </summary>
    private static bool ContainsSequence(byte[] source, byte[] pattern)
    {
        for (int i = 0; i <= source.Length - pattern.Length; i++)
        {
            bool match = !pattern.Where((t, j) => source[i + j] != t).Any();
            if (match) return true;
        }
        return false;
    }
}

public class PdfValidationResult
{
    public bool IsValid { get; set; } = false;
    public bool IsEncrypted { get; set; } = false;
    public string Message { get; set; } = string.Empty;
}
