import gql from 'graphql-tag';

// get the user and all user's groups
export default gql`
  query {
    user {
      id
      email
      username
      groups {
        id
        name
      }
      events {
        id
        details
      }
      schedules {
        id
        name
      }
    }
  }
`;
