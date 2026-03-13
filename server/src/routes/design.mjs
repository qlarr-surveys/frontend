import express from "express";
import { buildCodeIndex } from "@src/state/design/index.js";

const router = express.Router();

const isDesignStatePayload = (state) => {
  return (
    state &&
    typeof state === "object" &&
    !Array.isArray(state) &&
    state.Survey &&
    typeof state.Survey === "object" &&
    Array.isArray(state.Survey.children)
  );
};

router.post("/build-code-index", (req, res) => {
  const { state } = req.body ?? {};

  if (!isDesignStatePayload(state)) {
    return res.status(400).json({
      error: "Request body must include a design state object with Survey.children.",
    });
  }

  try {
    const index = buildCodeIndex(state);
    return res.json({ index });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to build code index.",
    });
  }
});

export default router;
