const { buildSchema } = require('graphql');

const userSchema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
  }

  type Query {
    getUsers: [User]
    getUser(id: ID!): User
  }

  type Mutation {
    createUser(userInput: UserInput): User
  }
`);

module.exports = userSchema;
