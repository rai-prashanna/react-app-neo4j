import React, { useState, useEffect , useRef} from "react";
import { useQuery, gql } from "@apollo/client";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { Panel } from 'primereact/panel';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import { Dropdown } from 'primereact/dropdown';
import { FloatLabel } from 'primereact/floatlabel';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button';

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

const GET_DELAVAL_SUBSCRIPTION_TYPES = gql`
query DevicesAggregate {
  deLavalSubscriptions {
    type
  }
}
`;

export default function UnServiceDevice() {
  const [unservicedDevices, setUnservicedDevices] = useState([]);
  const [farmCount, setFarmCount] = useState(0);
  const [devicesCount, setDevicesCount] = useState(0);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [serviceDate, setServiceDate] = useState(null);

  const [deLavalSubscriptions, setDeLavalSubscriptions] = useState([]);
  const [selectedDeLavalSubscription, setselectedDeLavalSubscription] = useState(null);
  const [hardwareVersion, setHardwareVersion] = useState(null);

  const [selectedCell, setSelectedCell] = useState(null);
  const toast = useRef(null);

  const onCellSelect = (event) => {
    toast.current.show({ severity: 'info', summary: 'Cell Selected', detail: `Name: ${event.value}`, life: 3000 });
};

const onCellUnselect = (event) => {
    toast.current.show({ severity: 'warn', summary: 'Cell Unselected', detail: `Name: ${event.value}`, life: 3000 });
};
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
  
  const {
    loading: deviceSubscriptionTypeLoading,
    error: deviceSubscriptionTypeError,
    data: deviceSubscriptionTypeData,
  } = useQuery(GET_DELAVAL_SUBSCRIPTION_TYPES, {
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

    if (deviceSubscriptionTypeData?.deLavalSubscriptions) {
      setDeLavalSubscriptions(deviceSubscriptionTypeData.deLavalSubscriptions);
      console.log("deLavalSubscriptionsdata:", deviceSubscriptionTypeData.deLavalSubscriptions);
    }
    
  }, [farmsData, unServicedDevicesData,devicesData,deviceTypesData,deviceSubscriptionTypeData]);

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
  <Splitter style={{ height: '50px' }} className="mb-2 mt-4">
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

  <Toast ref={toast} />

  <Panel 
    header="Unserviced devices with their respective components and sub-components"
    className="mt-8 shadow-2 border-round"
    style={{ width: '100%' }}
  >
    <div className="flex flex-wrap items-end gap-3 mb-4 mt-4">
      <Dropdown
        value={selectedDeviceType}
        onChange={(e) => setSelectedDeviceType(e.value)}
        options={deviceTypes}
        optionLabel="device_type"
        showClear
        placeholder="Select a device type"
        className="w-full md:w-16rem"
      />

      <Dropdown
        value={selectedDeLavalSubscription}
        onChange={(e) => setselectedDeLavalSubscription(e.value)}
        options={deLavalSubscriptions}
        optionLabel="delaval_subscription_type"
        showClear
        placeholder="Select a subscription"
        className="w-full md:w-16rem"
      />

      <InputNumber
        value={hardwareVersion}
        onValueChange={(e) => setHardwareVersion(e.value)}
        minFractionDigits={2}
        maxFractionDigits={3}
        className="w-full md:w-16rem"
        placeholder="Hardware version"
      />

      <Calendar
        inputId="service_date"
        value={serviceDate}
        onChange={(e) => setServiceDate(e.value)}
        className="w-full md:w-16rem"
        placeholder="Service date"
        showIcon
      />

      <Button label="Search" className="w-full md:w-5rem" />
    </div>

    <DataTable
      value={unservicedDevices}
      showGridlines
      tableStyle={{ minWidth: '50rem' }}
      paginator
      rows={5}
      rowsPerPageOptions={[5, 10, 25, 50]}
      cellSelection
      selectionMode="single"
      selection={selectedCell}
      onSelectionChange={(e) => setSelectedCell(e.value)}
      onCellSelect={onCellSelect}
      onCellUnselect={onCellUnselect}
    >
      <Column field="device_serial_number" header="Device ID" />
      <Column field="component_serial_number" header="Component ID" />
      <Column field="subcomponent_serial_number" header="Sub Component ID" />
    </DataTable>
  </Panel>
</div>


  );
}
