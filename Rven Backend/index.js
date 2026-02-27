import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import db from './db.js'; // archivo de conexión a PostgreSQL

const typeDefs = `#graphql
  type Alumno {
    id_alumno: ID!
    matricula: String!
    nombre_completo: String!
    id_grupo: Int!
    estado_academico: String
  }

  type Query {
    obtenerAlumnos: [Alumno]
  }

  type Mutation {
    # Esta mutación es EXACTAMENTE la que usa tu primer formulario de React
    agregarAlumno(matricula: String!, nombre: String!, id_grupo: Int!): Alumno
  }
`;

const resolvers = {
  Query: {
    obtenerAlumnos: async (_, __, { db }) => {
      const res = await db.query('SELECT * FROM alumnos');
      return res.rows;
    }
  },
  Mutation: {
    agregarAlumno: async (_, { matricula, nombre, id_grupo }, { db }) => {
      const query = `
        INSERT INTO alumnos (matricula, nombre_completo, id_grupo) 
        VALUES ($1, $2, $3) 
        RETURNING *`;
      const res = await db.query(query, [matricula, nombre, id_grupo]);
      console.log(`✅ Alumno guardado en PostgreSQL: ${nombre}`);
      return res.rows[0];
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async () => ({ db }), //conexión a PostgreSQL
});

console.log(`🚀 Servidor real conectado a PostgreSQL en: ${url}`);