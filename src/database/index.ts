import { Connection, createConnection, getConnectionOptions, } from "typeorm";

export default async (host = "12.0.0.3"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();

  return createConnection(
    Object.assign(defaultOptions, {
      host: process.env.NODE_ENV === "test" ? "localhost" : host,
      database:
        process.env.NODE_ENV === "test" ? "test_fin_ap" : defaultOptions.database
    })
  )
}