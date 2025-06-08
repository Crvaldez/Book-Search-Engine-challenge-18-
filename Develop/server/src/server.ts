import express from 'express';
import path from 'node:path';
import { ApolloServer } from 'apollo-server-express';
import db from './config/connection.js';
import routes from './routes/index.js';
import { authMiddleware } from './utils/auth.js';
import typeDefs from './schemas/typeDefs';
import resolvers from './schemas/resolvers';  

const app = express(); 
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// ✅ Start Apollo server and attach middleware
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });

  await server.start();
  server.applyMiddleware({ app });

  app.use(routes); // <-- keep this AFTER Apollo setup if still needed

  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🚀 GraphQL server ready at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
}

startApolloServer();
