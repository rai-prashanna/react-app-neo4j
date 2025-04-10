import React, { useState, useEffect } from "react";
import { useQuery, gql } from "@apollo/client";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { Panel } from 'primereact/panel';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Dropdown } from 'primereact/dropdown';
import { FloatLabel } from 'primereact/floatlabel';


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

const GET_DEVICE_TYPES = gql`
query DevicesAggregate {
  deviceTypes {
    name
  }
}
`;

export default function UnServiceDevice() {
  const [unservicedDevices, setUnservicedDevices] = useState([]);
  const [farmCount, setFarmCount] = useState(0);
  const [devicesCount, setDevicesCount] = useState(0);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);

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

  const {
    loading: devicesLoading,
    error: devicesError,
    data: devicesData,
  } = useQuery(GET_TOTAL_DEVICES, {
    fetchPolicy: "network-only",pollInterval: 5000,
  });

  const {
    loading: deviceTypesLoading,
    error: deviceTypesError,
    data: deviceTypesData,
  } = useQuery(GET_DEVICE_TYPES, {
    fetchPolicy: "network-only",pollInterval: 5000,
  });


  useEffect(() => {

    if (farmsData?.farmsAggregate?.count !== undefined) {
          console.log("Farms data:", farmsData);

      setFarmCount(farmsData.farmsAggregate.count);
    }

    if (devicesData?.devicesAggregate?.count !== undefined) {
      setDevicesCount(devicesData.devicesAggregate.count);
      console.log("Devices data:", devicesData);

    }

    if (unServicedDevicesData?.findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters) {
      setUnservicedDevices(unServicedDevicesData.findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters);
      console.log("UnservicedDevices data:", unServicedDevicesData);

    }
    if (deviceTypesData?.deviceTypes) {
      setDeviceTypes(deviceTypesData.deviceTypes);
      console.log("Device types data:", deviceTypesData);

    }
    
  }, [farmsData, unServicedDevicesData,devicesData,deviceTypesData]);

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
            <p className="m-0">{devicesCount}</p>
          </Panel>
        </SplitterPanel>
      </Splitter>

      <br />

      <div className="card">
        <h2>Unserviced Devices</h2>
{/*         <FloatLabel className="w-full md:w-14rem">  

        </FloatLabel> */}
        <Dropdown value={selectedDeviceType} onChange={(e) => setSelectedDeviceType(e.value)} options={deviceTypes} optionLabel="name" 
                showClear placeholder="Select a Device Type" className="w-full md:w-16rem mb-4 mt-4" />
                
        <DataTable value={unservicedDevices} showGridlines tableStyle={{ minWidth: "50rem" }}>
          <Column field="device_serial_number" header="Device ID" />
          <Column field="component_serial_number" header="Component ID" />
          <Column field="subcomponent_serial_number" header="Sub Component ID" />
        </DataTable>
      </div>
    </div>
  );
}
