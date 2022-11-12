const Configs = {
    cors: {
        origin: "http://localhost:3002",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "optionsSuccessStatus": 204,
      },
    httpPort: 3000,
    socketPort: 5000,
    secret: "secret",
}
export { Configs };