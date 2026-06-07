FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ["Direcional.Api/Direcional.Api.csproj", "Direcional.Api/"]
COPY ["Direcional.Application/Direcional.Application.csproj", "Direcional.Application/"]
COPY ["Direcional.Domain/Direcional.Domain.csproj", "Direcional.Domain/"]
COPY ["Direcional.Infrastructure/Direcional.Infrastructure.csproj", "Direcional.Infrastructure/"]
RUN dotnet restore "Direcional.Api/Direcional.Api.csproj"

COPY . .
WORKDIR "/src/Direcional.Api"
RUN dotnet build "Direcional.Api.csproj" -c Release -o /app/build
RUN dotnet publish "Direcional.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Direcional.Api.dll"]