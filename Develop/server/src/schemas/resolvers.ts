import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User.js'; // keep as .js if it's not converted
import { signToken } from '../utils/auth.js';
import { Resolvers } from '../types'; // optional custom types

const resolvers: Resolvers = {
  Query: {
    me: async (_parent, _args, context) => {
      if (context.user) {
        return User.findById(context.user._id);
      }
      throw new AuthenticationError('You need to be logged in');
    },
  },

  Mutation: {
    addUser: async (_parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },

    login: async (_parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new AuthenticationError('No user found');

      const isPwCorrect = await user.isCorrectPassword(password);
      if (!isPwCorrect) throw new AuthenticationError('Wrong password');

      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (_parent, { bookData }, context) => {
      if (!context.user) throw new AuthenticationError('Log in first');

      return User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { savedBooks: bookData } },
        { new: true }
      );
    },

    removeBook: async (_parent, { bookId }, context) => {
      if (!context.user) throw new AuthenticationError('Log in first');

      return User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );
    },
  },
};

export default resolvers;
