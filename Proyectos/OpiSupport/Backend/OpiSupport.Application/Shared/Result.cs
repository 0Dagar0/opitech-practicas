namespace OpiSupport.Application.Shared
{
    public class Result<T>
    {
        public bool IsSuccess { get; }
        public T? Value { get; }
        public string? Error { get; }

        private Result(bool isSuccess, T? value, string? error)
        {
            IsSuccess = isSuccess;
            Value = value;
            Error = error;
        }

        public static Result<T> Success(T value) => new(true, value, null);
        public static Result<T> Failure(string error) => new(false, default, error);

        // Para obtener el valor o lanzar excepción (solo si es necesario)
        public T GetValueOrThrow() => IsSuccess ? Value! : throw new InvalidOperationException(Error);
    }
}