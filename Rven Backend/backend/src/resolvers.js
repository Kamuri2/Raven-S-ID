const resolvers = {
  Mutation: {
    agregarAlumno: async (_, { matricula, nombre, id_grupo }, { db }) => {
      const query = `
        INSERT INTO alumnos (matricula, nombre_completo, id_grupo) 
        VALUES ($1, $2, $3) 
        RETURNING *`;
      const res = await db.query(query, [matricula, nombre, id_grupo]);
      return res.rows[0];
    },
    loginResolver: async (_, { username, password }) => {
      // 1. AQUÍ ESTÁ LA CONSULTA A LA BASE DE DATOS
      const consulta = 'SELECT * FROM usuarios_sistema WHERE username = $1';
      const resultado = await pool.query(consulta, [username]);
      
      const usuario = resultado.rows[0];

      // 2. Aquí valida si existe
      if (!usuario) {
        throw new Error('Credenciales inválidas');
      }

      // 3. Aquí compara la contraseña (usualmente encriptada con bcrypt)
      const passwordValido = compararPasswords(password, usuario.password);
      
      if (!passwordValido) {
        throw new Error('Credenciales inválidas');
      }

      // 4. Si todo está bien, le devuelve el pase (Token) a React
      return {
        user: usuario.username,
        token: "un_token_jwt_super_seguro"
      };
    }
  },
  Query: {
    obtenerAlumnos: async (_, __, { db }) => {
      const res = await db.query('SELECT * FROM alumnos');
      return res.rows;
    }
  }
};

module.exports = resolvers;