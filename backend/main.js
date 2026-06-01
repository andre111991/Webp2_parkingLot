import express from "express";
import cookieParser from 'cookie-parser'; // Middleware para lidar com cookies
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(cookieParser()); //coloca o resultado dentro do objeto req.cookies

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

import userRoutes from "./routes/utilizador.routes.js";
import veiculoRoutes from "./routes/veiculos.routes.js";
// import reservasRoutes from "./routes/reservas.routes.js";
import vagasRoutes from "./routes/vagas.routes.js";
import carregamentoRoutes from "./routes/carregamento.routes.js";

app.use("/utilizadores", userRoutes);
app.use("/veiculos", veiculoRoutes);
// app.use("/reservas", reservasRoutes);
app.use("/vagas", vagasRoutes);
app.use("/carregamentos", carregamentoRoutes);


app.use((req, res, next) => {
   const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
    error.status = 404;
     next(error);
 });

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
       description: err.message || 'Internal Server Error',
       ...(err.errors && { errors: err.errors })
    });
});

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});