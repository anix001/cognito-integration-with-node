import express, {Express, Request, Response} from "express";
import * as dotenv from 'dotenv'; 
import cognitoApiRoutes from "./routes/cognitoApiRoutes";

//[configure .env]
dotenv.config();

const app:Express = express();
const port = process.env.APP_PORT || 8000;

//[body parser]
app.use(express.json());

app.use('/api/cognito/user', cognitoApiRoutes);

app.get('/', (req:Request, res:Response)=>{
   res.send("Express + Typescript");
});

//[start the server]
app.listen(port,()=>{
  console.log(`[server]: Server is running on port ${port}`);
});