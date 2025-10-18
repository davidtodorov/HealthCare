using HealthCare.Infrastructure;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NSwag;
using NSwag.Generation.Processors.Security;
using System.Linq;
using WebApp.Extensions;
using WebApp.Services.Notifications;

namespace WebApp
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services
                .AddHttpContextAccessor()
                .AddDbContext<HealthCareDbContext>(options => options.UseSqlServer(this.Configuration.GetDefaultConnectionString()))
                .AddIdentity()
                //.AddJwtAuthentication(services.GetApplicationSettings(this.Configuration))  //USE FOR JWT AUTHENTICATION
                .AddCors(options =>
                {
                    options.AddPolicy("CorsApi", builder =>
                        builder
                            .AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod());
                })
                .AddMapperConfig()
                .AddApplicationServices()
                .AddControllers();

            services.Configure<WebPushOptions>(Configuration.GetSection("WebPush"));
            services.AddSingleton<IPushNotificationSender, WebPushNotificationSender>();
            services.AddHostedService<PrescriptionReminderHostedService>();

            services.AddEndpointsApiExplorer();
            services.AddOpenApiDocument(config =>
            {
                config.Title = "My API";
                config.Version = "v1";

                // Optional, but useful:
                config.AddSecurity("JWT", Enumerable.Empty<string>(), new OpenApiSecurityScheme
                {
                    Type = OpenApiSecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    Description = "Type into the textbox: Bearer {your JWT token}."
                });

                config.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
            });

            // In production, the Vue files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "client-app/dist/client-app/browser";
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();
            app.UseCors();
            if (env.IsDevelopment())
            {
                app.UseCors("CorsApi");
                app.UseOpenApi();
                app.UseSwaggerUi();
            }

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "client-app";

                //if (env.IsDevelopment())
                //{
                //    spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
                //}
            });

            app.ApplyMigrations();
            app.SeedDatabase();
        }

    }
}
