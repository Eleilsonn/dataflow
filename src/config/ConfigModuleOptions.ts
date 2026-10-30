import { ConfigModuleOptions } from "@nestjs/config";
import envSchema from "@/env/validation.env.js";

const options: ConfigModuleOptions = {
    validationSchema: envSchema,
    envFilePath: '../.env'
}

export default options
