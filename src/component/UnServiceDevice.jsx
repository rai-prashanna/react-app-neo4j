import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner"; // PrimeReact spinner

// GraphQL query
const GET_UNSERVICED_DEVICES_COMPONENTS = gql`
  query FindUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters {
    findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters {
      device_serial_number
      component_serial_number
      subcomponent_serial_number
    }
  }
`;

export default function UnServiceDevice() {
  const { loading, error, data } = useQuery(GET_UNSERVICED_DEVICES_COMPONENTS, {
    fetchPolicy: "network-only", // Optional but useful for always getting fresh data
    pollInterval: 5000,
  });

  const [result, setResult] = useState([]);

  useEffect(() => {
    if (data?.findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters) {
      setResult(data.findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters);
    }
  }, [loading]);


  if (loading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: "300px" }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (error) {
    return <p>Error fetching data: {error.message}</p>;
  }
  
  if (!loading) {
    return (
        <div className="card">
          <h2>Unserviced Devices</h2>
          <DataTable value={result} showGridlines tableStyle={{ minWidth: "50rem" }}>
            <Column field="device_serial_number" header="Device ID" />
            <Column field="component_serial_number" header="Component ID" />
            <Column field="subcomponent_serial_number" header="Sub Component ID" />
          </DataTable>
        </div>
      );
  }
  
}
