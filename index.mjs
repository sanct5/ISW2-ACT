import  Express from "express";
import bodyParser from "body-parser";
import {startConnection} from "./src/mongo/index.mjs";
import FiltersRouter from "./src/handlers/filters/index.mjs"
import Boom from "@hapi/boom";
import { PORT } from "./src/commons/env.mjs";

const app = Express();
app.use(bodyParser.json());

app.get("/", (req,res) =>{
    res.send("OK NORMAL");
})

app.use("/images", FiltersRouter);

app.use((error, req, res, next)=>{
    if(error){
        let err = Boom.isBoom(error) ? error: Boom.internal(error);
        const statusCode = err.output.statusCode;
        const payload = err.output.payload;
        return res.status(statusCode).json(payload);
    }
})

const startServer = async () =>{
    await startConnection();
    app.listen(PORT, () => {
        console.log(`http://localhost:${PORT}`);
    })
}

startServer();