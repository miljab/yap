import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routers/authRouter.js";
import postRouter from "./routers/postRouter.js";
import passport from "passport";
import "./passport/googlePassport.js";
import "./passport/githubPassport.js";
import commentRouter from "./routers/commentRouter.js";
import userRouter from "./routers/userRouter.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.use("/auth", authRouter);
app.use(postRouter);
app.use(commentRouter);
app.use(userRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));

export default app;
