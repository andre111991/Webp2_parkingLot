import express from "express";
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

import UserRoutes from "./routes/utilizador.routes.js";
import VeiculoRoutes from "./routes/veiculos.routes.js";

app.use("/utilizadores", UserRoutes);
app.use("/veiculos", VeiculoRoutes);

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