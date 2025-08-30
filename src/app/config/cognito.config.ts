import { Amplify } from "aws-amplify";

export const cognitoConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION!,
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
};

// Configure Amplify
Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: cognitoConfig.userPoolId,
        userPoolClientId: cognitoConfig.clientId,
      },
    },
  },
  {
    ssr: true,
  }
);
