using LFAS.SharedKernel;
using Microsoft.AspNetCore.Mvc;

namespace LFAS.Web;

public class ApiClient(HttpClient httpClient)
{
    public async Task<Result<Guid>> UploadStatement(IFormFile file, CancellationToken cancellationToken = default)
    {
        var content = new MultipartFormDataContent();
        content.Add(new StringContent(file.FileName), "file");

        HttpResponseMessage response =
            await httpClient.PostAsync("api/statements/upload", content, cancellationToken);

        if (response.IsSuccessStatusCode)
            return Result<Guid>.Success(
                await response.Content.ReadFromJsonAsync<Guid>(cancellationToken: cancellationToken));
        
        ProblemDetails? error = await response.Content.ReadFromJsonAsync<ProblemDetails>(cancellationToken: cancellationToken);

        return error != null ? Result<Guid>.Fail(error.Detail ?? "Something went wrong") : Result<Guid>.Fail("Something went wrong");

    }
}
