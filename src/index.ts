import express, { type Request, type Response } from "express";

// import middlewares
import morgan from "morgan";
import userRoutes from "./routes/usersRoutes.ts"
import itemsRoutes from "./routes/itemsRoutes.ts"
import notFoundMiddleware from "./middlewares/notFoundMiddleware.ts";
import dotenv from "dotenv"
dotenv.config();

const app = express();
const port = 3000;

// body parser middleware
app.use(express.json());

// logger middleware
app.use(morgan("dev"));
// app.use(morgan("combined"));

app.use("/api/v657/auth/", userRoutes);
app.use("/api/v657/items/", itemsRoutes);

// Endpoints
app.get("/", (req: Request, res: Response) => {
  res.send("Quiz #2 - API service");
});

app.get("/me", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Quiz #2 - API service",
  });
});

app.get("/studentInfo", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Student Information",
    data: {
      studentId: "680610657",
      firstName: "Khachenchai",
      lastName: "Jaikla",
      section: "001"
    }
  })
});

app.use(notFoundMiddleware);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

// Export app for vercel deployment
export default app;
