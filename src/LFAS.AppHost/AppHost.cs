IDistributedApplicationBuilder builder = DistributedApplication.CreateBuilder(args);

string databaseName = builder.Configuration["LFAS:Postgres:Database"] ?? "lfas";

IResourceBuilder<PostgresServerResource> postgres = builder
    .AddPostgres("postgres")
    .WithPgAdmin();

IResourceBuilder<PostgresDatabaseResource> database = postgres.AddDatabase("lfas-db", databaseName);

IResourceBuilder<ProjectResource> api = builder
    .AddProject<Projects.LFAS_Api>("api")
    .WithReference(database)
    .WaitFor(database);

builder
    .AddProject<Projects.LFAS_Web>("web")
    .WithExternalHttpEndpoints()
    .WithReference(api)
    .WaitFor(api);

builder.Build().Run();
