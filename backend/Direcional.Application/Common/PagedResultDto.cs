namespace Direcional.Application.Common;

public record PagedResultDto<T>(
	List<T> Items,
	int TotalCount,
	int PageNumber,
	int PageSize)
{
	public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
	public bool HasPreviousPage => PageNumber > 1;
	public bool HasNextPage => PageNumber < TotalPages;
}