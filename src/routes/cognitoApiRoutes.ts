import express, { Request, Response } from "express";
import {
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  ChangePasswordCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  UpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
//import generateHmacBase64 from "../common/generateHmacBase64";

const router = express.Router();

//[There is some error while making client code in common]

//[reset-password]
router.post("/confirm-password", async (req: Request, res: Response) => {
  const { username, newPassword, confirmationCode } = req.body;
  try {
    const client = new CognitoIdentityProviderClient(
      {
        region: process.env.COGNITO_REGION as string,
        credentials:{
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
        },
      }
    );

    const command = new ConfirmForgotPasswordCommand({
      ClientId: process.env.COGNITO_CLIENT_ID as string,
      Username: username,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    });

    const data = await client.send(command);
    res.status(200).send({ message: "Success creating new credentials", data });
  } catch (error) {
    const errorType = (error as any).__type || "UnknownError";
    res.status(500).send({ Error: errorType });
  }
});

//[send-confirmation-code-to-mail]
router.post('/forgot-password', async(req:Request, res:Response)=>{
  const {username} = req.body;
  try{

    const client = new CognitoIdentityProviderClient(
      {
        region: process.env.COGNITO_REGION as string,
        credentials:{
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
        },
      }
    );

    const command = new ForgotPasswordCommand({
       ClientId: process.env.COGNITO_CLIENT_ID,
       Username: username,
    });

    const data = await  client.send(command);
    res.status(200).send({ message: "New confirmation has been sent to email !!", data });
  }catch(error){
    const errorType = (error as any).__type || "UnknownError";
    res.status(500).send({ Error: errorType });
  }
});

//[change-user-confirmation-status]
router.post('/change-user-confirmation-status', async(req:Request, res:Response)=>{
  const {username, password, permanent}= req.body;
 
  try{

    const client = new CognitoIdentityProviderClient(
      {
        region: process.env.COGNITO_REGION as string,
        credentials:{
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
        },
      }
    );

    const command = new AdminSetUserPasswordCommand({
       Username: username,
       UserPoolId: process.env.COGNITO_USER_POOL_ID,
       Password: password,
       Permanent: permanent
    });
     
    const data = await client.send(command);
    res.status(200).send({ message: "Successfully changed user's confirmation status", data });
  }catch(error){
    console.log("error", error);
    let errorType = (error as any).__type || "UnknownError";
    res.status(500).send({ Error: errorType });
  }
});

//[get-User-Access-token]
router.get('/get-access-token', async(req:Request, res:Response)=>{
  const {username, password} = req.body;
  try{
    const client = new CognitoIdentityProviderClient(
      {
        region: process.env.COGNITO_REGION as string,
        credentials:{
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
        },
      }
    );
    
    //const secretHash = await generateHmacBase64(process.env.COGNITO_CLIENT_SECRET as string, username, process.env.COGNITO_CLIENT_ID as string); 

    const command = new InitiateAuthCommand({
       ClientId: process.env.COGNITO_CLIENT_ID,
       AuthFlow: "USER_PASSWORD_AUTH",
       AuthParameters: {
           USERNAME: username, // The user's username
           PASSWORD: password, // The user's password
          //  SECRET_HASH:secretHash //We also need to send this if we have check the Generate client secret.
         },
    });

    const data = await  client.send(command);
    res.status(200).send({ message: "Success fetching the tokens !!", data });
  }catch(error){
    let errorType = (error as any).__type || "UnknownError";
    res.status(500).send({ Error: errorType });
  }
});

//[update-user-attribute-as-user]
router.post('/update-user-attribute-user', async(req:Request, res:Response)=>{
  const {userAttributes} = req.body;
  const accessToken = req.headers['authorization']?.split(' ')[1];
  try{

    const client = new CognitoIdentityProviderClient(
      {
        region: process.env.COGNITO_REGION as string,
        credentials:{
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
        },
      }
    );

    const command = new UpdateUserAttributesCommand({
      //  UserAttributes:[
      //      {
      //          Name:'address', //attribute name
      //          Value:'location' //attribute value
      //      }
      //  ],
       UserAttributes: userAttributes,
       AccessToken:accessToken
    });

    const data = await  client.send(command);
    res.status(200).send({ message: "Successfully updating user's attributes !!", data });
  }catch(error){
    let errorType = (error as any).__type || "UnknownError";
    res.status(500).send({ Error: errorType });
  }
});

//[update-user-attribute-as-admin]
router.post("/update-user-attribute-admin", async(req:Request, res:Response)=>{
  const {username, userAttributes} = req.body;

  try{
    const client = new CognitoIdentityProviderClient(
      {
        region: process.env.COGNITO_REGION as string,
        credentials:{
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
        },
      }
    );

    const command = new AdminUpdateUserAttributesCommand({
      //  UserAttributes:[
      //      {
      //          Name:'address', //attribute name
      //          Value:'location' //attribute value
      //      }
      //  ],
       UserAttributes: userAttributes,
       Username: username,
       UserPoolId: process.env.COGNITO_USER_POOL_ID
    });

    const data = await  client.send(command);
    res.status(200).send({ message: "Successfully updating user's attributes !!", data });
  }catch(error){
    let errorType = (error as any).__type || "UnknownError";
    res.status(500).send({ Error: errorType });
  }
});


router.post("/change-password", async(req:Request, res:Response)=>{
  const accessToken = req.headers['authorization']?.split(' ')[1];
  const {previousPassword, newPassword} = req.body;

  try{
    const client = new CognitoIdentityProviderClient(
      {
        region: process.env.COGNITO_REGION as string,
        credentials:{
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
        },
      }
    );

    const command = new ChangePasswordCommand({
      AccessToken: accessToken,
      PreviousPassword: previousPassword,
      ProposedPassword: newPassword
    })

    const data = await client.send(command);
    res.status(200).send({ message: "Successfully changed the password !!", data });

  }catch(error){
    let errorType = (error as any).__type || "UnknownError";
    res.status(500).send({ Error: errorType });
  }
});


export default router;
