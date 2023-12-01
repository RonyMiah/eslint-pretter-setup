import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT,
  database_url: process.env.DARABASE_URL,
  bcrypt_solt_round: process.env.BYCRIPT_SOLT_ROUND,
  default_password: process.env.DEFAULT_PASSWORD,
};
