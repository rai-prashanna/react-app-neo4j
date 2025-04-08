import { gql } from "@apollo/client";
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