import { Connection, createConnection, getConnectionOptions } from 'typeorm';

(async () => await createConnection())();

// export default async (): Promise<Connection> => {
//   const defaultOptions = await getConnectionOptions();

//   return createConnection(
//     Object.assign(defaultOptions, {
//       database:
//         process.env.NODE_ENV === 'test'
//           ? 'fin_api'
//           : defaultOptions.database,
//     })
//   );
// };
