import express from "express";
import designRouter from "./routes/design.mjs";

const app = express();
const port = Number(process.env.PORT) || 4000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/design", designRouter);

app.listen(port, () => {
  console.log(`Express server listening on http://localhost:${port}`);
});

export default app;
