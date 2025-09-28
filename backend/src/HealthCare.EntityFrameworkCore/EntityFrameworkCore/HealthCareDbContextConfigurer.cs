using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Data.Common;

namespace HealthCare.EntityFrameworkCore;

public static class HealthCareDbContextConfigurer
{
    public static void Configure(DbContextOptionsBuilder<HealthCareDbContext> builder, string connectionString)
    {
        builder.UseSqlServer(connectionString).LogTo(Console.WriteLine, LogLevel.Debug);
    }

    public static void Configure(DbContextOptionsBuilder<HealthCareDbContext> builder, DbConnection connection)
    {
        builder.UseSqlServer(connection).LogTo(Console.WriteLine, LogLevel.Debug);
    }
}
