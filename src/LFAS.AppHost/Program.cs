var builder = DistributedApplication.CreateBuilder(args);

var databaseName = builder.Configuration["LFAS:Postgres:Database"] ?? "lfas";

var postgres = builder
    .AddPostgres("postgres")
    .WithPgAdmin();

var database = postgres.AddDatabase("lfasdb", databaseName);

var api = builder
    .AddProject<Projects.LFAS_Api>("api")
    .WithReference(database)
    .WaitFor(database);

builder
    .AddProject<Projects.LFAS_Web>("web")
    .WithExternalHttpEndpoints()
    .WithReference(api)
    .WaitFor(api);

builder.Build().Run();
