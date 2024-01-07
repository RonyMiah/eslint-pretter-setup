import jwt from 'jsonwebtoken';

export const createToken = (
  jwtPayloadData: { userId: string; role: string },
  secrect: string,
  expireIn: string,
) => {
  return jwt.sign(jwtPayloadData, secrect, {
    expiresIn: expireIn,
  });
};
