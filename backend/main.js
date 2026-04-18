console.log("a carregar...");
import express from "express";
import dotenv from "dotenv";

dotenv.config();


const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

console.log(`PORT: ${PORT}, HOST: ${HOST}`);

app.use(express.json());

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
       description: err.message || 'Internal Server Error',
       ...(err.errors && { errors: err.errors })
    });
});

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});