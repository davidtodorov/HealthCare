FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src
COPY ["src/HealthCare.Web.Host/HealthCare.Web.Host.csproj", "src/HealthCare.Web.Host/"]
COPY ["src/HealthCare.Web.Core/HealthCare.Web.Core.csproj", "src/HealthCare.Web.Core/"]
COPY ["src/HealthCare.Application/HealthCare.Application.csproj", "src/HealthCare.Application/"]
COPY ["src/HealthCare.Core/HealthCare.Core.csproj", "src/HealthCare.Core/"]
COPY ["src/HealthCare.EntityFrameworkCore/HealthCare.EntityFrameworkCore.csproj", "src/HealthCare.EntityFrameworkCore/"]
WORKDIR "/src/src/HealthCare.Web.Host"
RUN dotnet restore 

WORKDIR /src
COPY ["src/HealthCare.Web.Host", "src/HealthCare.Web.Host"]
COPY ["src/HealthCare.Web.Core", "src/HealthCare.Web.Core"]
COPY ["src/HealthCare.Application", "src/HealthCare.Application"]
COPY ["src/HealthCare.Core", "src/HealthCare.Core"]
COPY ["src/HealthCare.EntityFrameworkCore", "src/HealthCare.EntityFrameworkCore"]
WORKDIR "/src/src/HealthCare.Web.Host"
RUN dotnet publish -c Release -o /publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
EXPOSE 80
WORKDIR /app
COPY --from=build /publish .
ENTRYPOINT ["dotnet", "HealthCare.Web.Host.dll"]
