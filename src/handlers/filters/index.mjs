import {Router} from "express";
import applyFiltersHandler from "./applyFiltersHandler.mjs";

const router = Router();

router.get("/",(req,res)=>{
    res.send("OK GET IMAGES");
})

router.post("/", applyFiltersHandler);

export default router;