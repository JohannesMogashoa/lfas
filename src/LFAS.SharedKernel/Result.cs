namespace LFAS.SharedKernel;

public class Result
{
    public string? ErrorMessage { get; set; }
    public bool IsSuccessful { get; set; }

    public static Result Success()
    {
        return new Result { IsSuccessful = true };
    }

    public static Result Fail(string errorMessage)
    {
        return new Result { IsSuccessful = false, ErrorMessage = errorMessage };
    }
}

public class Result<T> : Result
{
    public T? Data { get; set; }

    public static Result<T> Success(T data)
    {
        return new Result<T> { IsSuccessful = true, Data = data };
    }

    public new static Result<T> Fail(string errorMessage)
    {
        return new Result<T> { IsSuccessful = false, ErrorMessage = errorMessage };
    }
}
