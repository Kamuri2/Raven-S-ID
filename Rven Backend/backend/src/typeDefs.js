const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Alumno {
    id_alumno: ID
    matricula: String
    nombre_completo: String
    id_grupo: Int
  }

  type Mutation {
    agregarAlumno(matricula: String!, nombre: String!, id_grupo: Int!): Alumno
  }

  type Query {
    obtenerAlumnos: [Alumno]
  }
`;

module.exports = typeDefs;