import jwt, { JwtPayload } from 'jsonwebtoken';

export const createToken = (
  jwtPayloadData: { userId: string; role: string },
  secrect: string,
  expireIn: string,
) => {
  return jwt.sign(jwtPayloadData, secrect, {
    expiresIn: expireIn,
  });
};

export const verifyToken = (token: string, access_secret: string) => {
  return jwt.verify(token as string, access_secret) as JwtPayload;
};
