import app from "./app";

function startServer() {
  const PORT = 3001;

  app.listen(PORT, () => {
    console.log(`The application is running on ${PORT}`);
  });
}

startServer();
