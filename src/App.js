import logo from './logo.svg';
import Result from './Result';

import './App.css';
import { useQuery, gql } from '@apollo/client';
import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";
const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
});

const GET_UNSERVICED_DEVICES_COMPONENTS = gql`
query FindUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters {
  findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters {
    device_serial_number
    component_serial_number
    subcomponent_serial_number
  }
}
`;
function App() {
  const { loading, error, data, refetch } = useQuery(GET_UNSERVICED_DEVICES_COMPONENTS, {
    fetchPolicy: "network-only",
    pollInterval: 5000, });
    if (error) return <p>Error</p>;
    if (loading) return <p>Loading...</p>;

  return (
    <div className="App">

      <Result results={data.findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters} />
    </div>
  );

}

export default App;
