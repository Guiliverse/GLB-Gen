import express from "express";
import { GenerateGLB } from "./GenerateGLB.js";

const jsonBodyParser = express.json();
const router = express.Router();

router.post("/api/gen", jsonBodyParser, async (req, res) => {
  const setGLBUrl = async () => {
    let glbUrl = await GenerateGLB(req.body);
    glbUrl = glbUrl.slice(7, glbUrl.length);
    console.log(glbUrl);
  };
  res.json(setGLBUrl()).end();
});

export default router;
