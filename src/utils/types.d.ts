declare namespace NodeJS {
  export interface ProcessEnv {
    PORT: number;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
    POSTGRES_PORT: string;
    DATABASE_URL: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    QUEUE_NAME: string;
  }
}
