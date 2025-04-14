import React, { useState, useEffect , useRef} from "react";
import { useQuery, gql, useLazyQuery } from "@apollo/client";
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
import { Sidebar } from 'primereact/sidebar';

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

const GET_MY_UNSERVICED_DEVICES_COMPONENTS = gql`
query FindUnservicedDevicesOrComponentsOrSubComponents($hardwareVersion: Float!, $subscriptionType: String!, $deviceType: String!, $serviceDate: Date!) {
  findUnservicedDevicesOrComponentsOrSubComponents(hardwareVersion: $hardwareVersion, subscriptionType: $subscriptionType, deviceType: $deviceType, serviceDate: $serviceDate) {
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


// Utility to format a JS Date to YYYY-MM-DD in local time
const formatDateToLocalISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function UnServiceDevice() {
  const [unservicedDevices, setUnservicedDevices] = useState([]);
  const [myUnservicedDevices, setMyUnservicedDevices] = useState([]);
  const [visibleRight, setVisibleRight] = useState(false);

  const [farmCount, setFarmCount] = useState(0);
  const [devicesCount, setDevicesCount] = useState(0);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [serviceDate, setServiceDate] = useState(new Date("2017-01-20"));

  const [deLavalSubscriptions, setDeLavalSubscriptions] = useState([]);
  const [selectedDeLavalSubscription, setselectedDeLavalSubscription] = useState(null);
  const [hardwareVersion, setHardwareVersion] = useState(2.1);

  const [selectedCell, setSelectedCell] = useState(null);
  const toast = useRef(null);
  const [searchButton, setSearchButton] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  const onCellSelect = (event) => {
    toast.current.show({ severity: 'info', summary: 'Cell Selected', detail: `Name: ${event.value}, index: ${event}`, life: 3000 });
    console.log(`Name: ${event.value}, index: ${event.index}, field: ${event.field}`);

};

const onCellUnselect = (event) => {
    toast.current.show({ severity: 'warn', summary: 'Cell Unselected', detail: `Name: ${event.value} , index: ${event.index}`, life: 3000 });
};

const buttonClicked = (event) => {
  toast.current.show({ severity: 'info', summary: 'Button clicked', detail: `Search button was clicked`, life: 3000 });
  
  if(selectedDeviceType!=null && selectedDeLavalSubscription!=null && serviceDate!=null && hardwareVersion!=null){
    setSearchButton(true);
    fetchUnservicedDevices();
  }
};

const [fetchUnservicedDevices, {
  loading: unMyServicedDevicesLoading,
  error: unMyServicedDevicesError,
  data: unMyServicedDevicesData,
}] = useLazyQuery(GET_MY_UNSERVICED_DEVICES_COMPONENTS, {
  fetchPolicy: "network-only",
  onCompleted: (data) => {
    console.log("Unserviced devices data:", data);
    setMyUnservicedDevices(data.findUnservicedDevicesOrComponentsOrSubComponents);
    toast.current.show({ severity: 'success', summary: 'Success', detail: 'Unserviced devices fetched successfully', life: 3000 });
    setUnservicedDevices(data.findUnservicedDevicesOrComponentsOrSubComponents);
    setSearchButton(false);
  },
  onError: (error) => {
    console.error("Error fetching unserviced devices:", error);
    toast.current.show({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
  },
  variables: {
    hardwareVersion: hardwareVersion==null?1.2:hardwareVersion,
    subscriptionType: selectedDeLavalSubscription==null?"DeLaval Alerts":selectedDeLavalSubscription.type,
    deviceType: selectedDeviceType==null?"VMS™ V300":selectedDeviceType.name,
    serviceDate: serviceDate==null?new Date("2017-01-20"):formatDateToLocalISO(serviceDate),
  },
});


  const {
    loading: farmsLoading,
    error: farmsError,
    data: farmsData,
  } = useQuery(GET_TOTAL_FARMS, {
    fetchPolicy: "network-only",
    pollInterval: 5000000,
  });

  const {
    loading: devicesLoading,
    error: devicesError,
    data: devicesData,
  } = useQuery(GET_TOTAL_DEVICES, {
    fetchPolicy: "network-only",pollInterval: 5000000,
  });

  const {
    loading: unServicedDevicesLoading,
    error: unServicedDevicesError,
    data: unServicedDevicesData,
  } = useQuery(GET_UNSERVICED_DEVICES_COMPONENTS, {
    fetchPolicy: "network-only",
  });

  const {
    loading: deviceTypesLoading,
    error: deviceTypesError,
    data: deviceTypesData,
  } = useQuery(GET_DEVICE_TYPES, {
    fetchPolicy: "network-only"
  });
  
  const {
    loading: deviceSubscriptionTypeLoading,
    error: deviceSubscriptionTypeError,
    data: deviceSubscriptionTypeData,
  } = useQuery(GET_DELAVAL_SUBSCRIPTION_TYPES, {
    fetchPolicy: "network-only",
  });


  useEffect(() => {
    // if (searchButton) {
    //   fetchUnservicedDevices({
    //     variables: {
    //       hardwareVersion: hardwareVersion,
    //       subscriptionType: selectedDeLavalSubscription.type,
    //       deviceType: selectedDeviceType.name,
    //       serviceDate: serviceDate,
    //     },
    //   });
    //   setSearchButton(false);
    // }   

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
      console.log("Device types data:", deviceTypesData.deviceTypes);
      if(selectedDeviceType === null)
        setSelectedDeviceType(deviceTypesData.deviceTypes[16])
     ;
    }

    if (deviceSubscriptionTypeData?.deLavalSubscriptions) {
      setDeLavalSubscriptions(deviceSubscriptionTypeData.deLavalSubscriptions);
      console.log("deLavalSubscriptionsdata:", deviceSubscriptionTypeData.deLavalSubscriptions);
      if(selectedDeLavalSubscription === null)
        setselectedDeLavalSubscription(deviceSubscriptionTypeData.deLavalSubscriptions[9])
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
  <Splitter style={{ height: '50px'}} className="mb-2 mt-4">
    <SplitterPanel className="flex align-items-center justify-content-center">
      <Panel header="Total Farms" style={{ height: '100%', width: '100%'}}>
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
        optionLabel="name"
        showClear
        placeholder="Select a device type"
        className="w-full md:w-16rem"
      />

      <Dropdown
        value={selectedDeLavalSubscription}
        onChange={(e) => setselectedDeLavalSubscription(e.value)}
        options={deLavalSubscriptions}
        optionLabel="type"
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
      onChange={(e) => {setServiceDate(e.value)}}
      className="w-full md:w-16rem"
      placeholder="Service date"
      showIcon
      dateFormat="yy-mm-dd"
/>

<Button
  icon="pi pi-search"
  label="Search"
  className="w-full md:w-7rem"
  onClick={() => buttonClicked()}
  disabled={
    !selectedDeviceType ||
    !selectedDeLavalSubscription ||
    !serviceDate ||
    !hardwareVersion
  }
/>
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
  <Sidebar visible={visibleRight} position="right" onHide={() => setVisibleRight(false)}>
                <h2>Right Sidebar</h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
  </Sidebar>
</div>


  );
}
