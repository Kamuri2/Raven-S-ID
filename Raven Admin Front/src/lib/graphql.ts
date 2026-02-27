import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user {
        id
        username
      }
    }
  }
`;

export const ADD_STUDENT_MUTATION = gql`
  mutation AddStudent($id: ID!, $name: String!, $career: String!) {
    addStudent(id: $id, name: $name, career: $career) {
      id
      name
      career
    }
  }
`;
