import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { Panel } from 'primereact/panel';
import { Splitter, SplitterPanel } from 'primereact/splitter';

// GraphQL queries

const GET_TOTAL_DEVICES = gql`
query DevicesAggregate {
  devicesAggregate {
    count
  }
}
`;

const GET_UNSERVICED_DEVICES_COMPONENTS = gql`
  query FindUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters {
    findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters {
      device_serial_number
      component_serial_number
      subcomponent_serial_number
    }
  }
`;

const GET_TOTAL_FARMS = gql`
  query FarmsAggregate {
    farmsAggregate {
      count
    }
  }
`;

export default function UnServiceDevice() {
  const [unservicedDevices, setUnservicedDevices] = useState([]);
  const [farmCount, setFarmCount] = useState(0);
  const [devicesCount, setDevicesCount] = useState(0);

  const {
    loading: farmsLoading,
    error: farmsError,
    data: farmsData,
  } = useQuery(GET_TOTAL_FARMS, {
    fetchPolicy: "network-only",
    pollInterval: 5000,
  });

  const {
    loading: unServicedDevicesLoading,
    error: unServicedDevicesError,
    data: unServicedDevicesData,
  } = useQuery(GET_UNSERVICED_DEVICES_COMPONENTS, {
    fetchPolicy: "network-only",
  });



  useEffect(() => {
    console.log("Farms data:", farmsData);
    console.log("Devices data:", unServicedDevicesData);

    if (farmsData?.farmsAggregate?.count !== undefined) {
      setFarmCount(farmsData.farmsAggregate.count);
    }

    if (unServicedDevicesData?.findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters) {
      setUnservicedDevices(unServicedDevicesData.findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters);
    }
  }, [farmsData, unServicedDevicesData]);

  if (farmsLoading || unServicedDevicesLoading) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ height: "300px" }}>
        <ProgressSpinner />
      </div>
    );
  }

  if (farmsError || unServicedDevicesError) {
    return <p>Error fetching data: {farmsError?.message || unServicedDevicesError?.message}</p>;
  }

  return (
    <div>
      <Splitter style={{ height: '50px'}} className="mb-2 mt-4">
        <SplitterPanel className="flex align-items-center justify-content-center">
          <Panel header="Total Farms" style={{ height: '100%', width: '100%' }}>
            <p className="m-0">{farmCount}</p>
          </Panel>
        </SplitterPanel>
        <SplitterPanel className="flex align-items-center justify-content-center">
          <Panel header="Total Devices" style={{ height: '100%', width: '100%' }}>
            <p className="m-0">10</p>
          </Panel>
        </SplitterPanel>
      </Splitter>

      <br />

      <div className="card">
        <h2>Unserviced Devices</h2>
        <DataTable value={unservicedDevices} showGridlines tableStyle={{ minWidth: "50rem" }}>
          <Column field="device_serial_number" header="Device ID" />
          <Column field="component_serial_number" header="Component ID" />
          <Column field="subcomponent_serial_number" header="Sub Component ID" />
        </DataTable>
      </div>
    </div>
  );
}
