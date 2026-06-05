FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Direcional.sln .
COPY Direcional.Domain/Direcional.Domain.csproj Direcional.Domain/
COPY Direcional.Application/Direcional.Application.csproj Direcional.Application/
COPY Direcional.Infrastructure/Direcional.Infrastructure.csproj Direcional.Infrastructure/
COPY Direcional.Api/Direcional.Api.csproj Direcional.Api/

RUN dotnet restore Direcional.Api/Direcional.Api.csproj

COPY . .

RUN dotnet publish Direcional.Api/Direcional.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Direcional.Api.dll"]