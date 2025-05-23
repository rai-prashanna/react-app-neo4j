import React, { useState, useEffect, useRef } from "react";
import { useQuery, gql, useLazyQuery } from "@apollo/client";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { Panel } from "primereact/panel";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { Toast } from "primereact/toast";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { GraphQLService } from "../service/GraphQLService";

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
  query FindUnservicedDevicesOrComponentsOrSubComponents(
    $hardwareVersion: Float!
    $subscriptionType: String!
    $deviceType: String!
    $serviceDate: Date!
  ) {
    findUnservicedDevicesOrComponentsOrSubComponents(
      hardwareVersion: $hardwareVersion
      subscriptionType: $subscriptionType
      deviceType: $deviceType
      serviceDate: $serviceDate
    ) {
      device_serial_number
      component_serial_number
      subcomponent_serial_number
    }
  }
`;

const GET_DEVICE_DETAIL = gql`
  query Query($where: DeviceWhere) {
    devices(where: $where) {
      hardware_version
      installed_at
      label
      serial_number
      serviced_at
    }
  }
`;

const GET_COMPONENT_DETAIL = gql`
  query Components($where: ComponentWhere) {
    components(where: $where) {
      serial_number
      label
      installed_at
      serviced_at
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
const GET_DELAVAL_SUBSCRIPTION_COUNT = gql`
  query DeLavalSubscriptionsAggregate {
    deLavalSubscriptionsConnection {
      totalCount
    }
  }
`;

// Utility to format a JS Date to YYYY-MM-DD in local time
const formatDateToLocalISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function UnServiceDevice() {
  const [visible, setVisible] = useState(false);
  const [headerName, setHeaderName] = useState("Device details");

  const [unservicedDevices, setUnservicedDevices] = useState([]);
  const [myUnservicedDevices, setMyUnservicedDevices] = useState([]);
  const [device, setDevice] = useState(null);
  const [component, setComponent] = useState(null);

  const [selectedDeviceId, setSelectedDeviceId] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState([]);

  const [farmCount, setFarmCount] = useState(0);
  const [devicesCount, setDevicesCount] = useState(0);
  const [delavalSubscriptionsCount, setDelavalSubscriptionsCount] = useState(0);

  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [serviceDate, setServiceDate] = useState(new Date("2017-01-20"));

  const [deLavalSubscriptions, setDeLavalSubscriptions] = useState([]);
  const [selectedDeLavalSubscription, setselectedDeLavalSubscription] =
    useState(null);
  const [hardwareVersion, setHardwareVersion] = useState(2.1);

  const [selectedCell, setSelectedCell] = useState(null);
  const toast = useRef(null);
  const [searchButton, setSearchButton] = useState(false);

  const onCellSelect = (event) => {
    console.log(`Name: ${event.value}, column: ${event.field}`);
    setSelectedDeviceId(event.value);
    if (event.field === "device_serial_number") {
      setHeaderName("Device details");
      fetchDeviceDetail();
      setComponent(null);
      // setVisible((visible) => !visible);
    } else if (event.field === "component_serial_number") {
      fetchComponentDetail();
      setHeaderName("Component details");
      setDevice(null);
      // setVisible((visible) => !visible);
    } else if (event.field === "subcomponent_serial_number") {
      fetchComponentDetail();
      setDevice(null);
      setHeaderName("Sub-component details");
      // setVisible((visible) => !visible);
    }
    console.log("Selected cell:", event.value);
  };

  const customHeader = (
    <div className="w-full bg-blue-500">
      <div className="flex items-center w-full px-4 py-3">
        <span className="font-bold text-lg text-white">{headerName}</span>
        <button
          onClick={() => {
            setSelectedCell(null);
            setVisible(false);
          }}
          className="ml-auto text-white bg-transparent border-none text-xl cursor-pointer"
        >
          <i className="pi pi-times" />
        </button>
      </div>
      <Divider className="m-0" />
    </div>
  );

  const onCellUnselect = (event) => {
    // toast.current.show({
    //   severity: "warn",
    //   summary: "Cell Unselected",
    //   detail: `Name: ${event.value} , column: ${event.field}`,
    //   life: 3000,
    // });
    console.log(`onCellUnselect`);
    setSelectedCell(null);
    setVisible((visible) => !visible);
  };

  const buttonClicked = (event) => {
    toast.current.show({
      severity: "info",
      summary: "Button clicked",
      detail: `Search button was clicked`,
      life: 3000,
    });
    if (
      selectedDeviceType != null &&
      selectedDeLavalSubscription != null &&
      serviceDate != null &&
      hardwareVersion != null
    ) {
      setSearchButton(true);
      fetchUnservicedDevices();
    }
  };

  const [
    fetchComponentDetail,
    {
      loading: componentDetailLoading,
      error: componentDetailError,
      data: componentDetailData,
    },
  ] = useLazyQuery(GET_COMPONENT_DETAIL, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log("get component details data:", data);
      data.components.map((component) => {
        console.log("component details:", component);
        setComponent(component);
        setVisible(true);
      });
    },
    onError: (error) => {
      console.error("Error fetching component:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
        life: 3000,
      });
    },
    variables: {
      where: {
        serial_number_EQ: selectedDeviceId,
      },
    },
  });

  const [
    fetchDeviceDetail,
    {
      loading: deviceDetailLoading,
      error: deviceDetailError,
      data: deviceDetailData,
    },
  ] = useLazyQuery(GET_DEVICE_DETAIL, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log("get device details data:", data);
      // toast.current.show({
      //   severity: "success",
      //   summary: "Success",
      //   detail: "Device detail fetched successfully",
      //   life: 3000,
      // });
      data.devices.map((device) => {
        console.log("device details:", device);
        setDevice(device);
        setVisible(true);
      });
    },
    onError: (error) => {
      console.error("Error fetching unserviced devices:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
        life: 3000,
      });
    },
    variables: {
      where: {
        serial_number_EQ: selectedDeviceId,
      },
    },
  });

  const [
    fetchUnservicedDevices,
    {
      loading: unMyServicedDevicesLoading,
      error: unMyServicedDevicesError,
      data: unMyServicedDevicesData,
    },
  ] = useLazyQuery(GET_MY_UNSERVICED_DEVICES_COMPONENTS, {
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      console.log("Unserviced devices data:", data);
      setMyUnservicedDevices(
        data.findUnservicedDevicesOrComponentsOrSubComponents
      );
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Unserviced devices fetched successfully",
        life: 3000,
      });
      setUnservicedDevices(
        data.findUnservicedDevicesOrComponentsOrSubComponents
      );
      setSearchButton(false);
    },
    onError: (error) => {
      console.error("Error fetching unserviced devices:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
        life: 3000,
      });
    },
    variables: {
      hardwareVersion: hardwareVersion == null ? 1.2 : hardwareVersion,
      subscriptionType:
        selectedDeLavalSubscription == null
          ? "DeLaval Alerts"
          : selectedDeLavalSubscription.type,
      deviceType:
        selectedDeviceType == null ? "VMS™ V300" : selectedDeviceType.name,
      serviceDate:
        serviceDate == null
          ? new Date("2017-01-20")
          : formatDateToLocalISO(serviceDate),
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
    fetchPolicy: "network-only",
    pollInterval: 5000000,
  });

  const {
    loading: subscriptionLoading,
    error: subscriptionError,
    data: totalSubscription,
  } = useQuery(GET_DELAVAL_SUBSCRIPTION_COUNT, {
    fetchPolicy: "network-only",
    pollInterval: 5000000,
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
    fetchPolicy: "network-only",
  });

  const {
    loading: deviceSubscriptionTypeLoading,
    error: deviceSubscriptionTypeError,
    data: deviceSubscriptionTypeData,
  } = useQuery(GET_DELAVAL_SUBSCRIPTION_TYPES, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (farmsData?.farmsAggregate?.count !== undefined) {
      console.log("Farms data:", farmsData);
      setFarmCount(farmsData.farmsAggregate.count);
    }

    if (
      totalSubscription?.deLavalSubscriptionsConnection?.totalCount !==
      undefined
    ) {
      console.log(
        "Subscription data:",
        totalSubscription.deLavalSubscriptionsConnection.totalCount
      );
      setDelavalSubscriptionsCount(
        totalSubscription.deLavalSubscriptionsConnection.totalCount
      );
    }

    if (devicesData?.devicesAggregate?.count !== undefined) {
      setDevicesCount(devicesData.devicesAggregate.count);
      console.log("Devices data:", devicesData);
    }

    if (
      unServicedDevicesData?.findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters
    ) {
      setUnservicedDevices(
        unServicedDevicesData.findUnservicedDevicesOrComponentsOrSubComponentsWithHardCodedParameters
      );
      console.log("UnservicedDevices data:", unServicedDevicesData);
    }
    if (deviceTypesData?.deviceTypes) {
      setDeviceTypes(deviceTypesData.deviceTypes);
      console.log("Device types data:", deviceTypesData.deviceTypes);
      if (selectedDeviceType === null)
        setSelectedDeviceType(deviceTypesData.deviceTypes[16]);
    }

    if (deviceSubscriptionTypeData?.deLavalSubscriptions) {
      setDeLavalSubscriptions(deviceSubscriptionTypeData.deLavalSubscriptions);
      console.log(
        "deLavalSubscriptionsdata:",
        deviceSubscriptionTypeData.deLavalSubscriptions
      );
      if (selectedDeLavalSubscription === null)
        setselectedDeLavalSubscription(
          deviceSubscriptionTypeData.deLavalSubscriptions[9]
        );
    }
  }, [
    farmsData,
    unServicedDevicesData,
    devicesData,
    deviceTypesData,
    deviceSubscriptionTypeData,
  ]);

  if (farmsLoading || unServicedDevicesLoading) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ height: "300px" }}
      >
        <ProgressSpinner />
      </div>
    );
  }

  if (farmsError || unServicedDevicesError) {
    return (
      <p>
        Error fetching data:{" "}
        {farmsError?.message || unServicedDevicesError?.message}
      </p>
    );
  }

  return (
    <div>
      <Toast ref={toast} />
      <div class="block font-bold text-center p-2 border-round mb-2">
      <div class="grid">
        <div class="col">
          <div class="text-center font-bold">
            <Panel
              header="Total Farms"
              style={{ height: "100%", width: "100%" }}
              className="mypanel align-items-center"
            >
              <p className="m-0 text-6xl text-left	">{farmCount}</p>
            </Panel>
          </div>
        </div>
        <div class="col">
          <div class="text-center font-bold ">
            <Panel
              header="Total Devices"
              style={{ height: "100%", width: "100%" }}
              className="mypanel align-items-center"
            >
              <p className="m-0 text-6xl text-left	">{devicesCount}</p>
            </Panel>
          </div>
        </div>
        <div class="col">
          <div class="text-center font-bold ">
            <Panel
              header="Total Subscriptions"
              style={{ height: "100%", width: "100%" }}
              className="mypanel align-items-center"
            >
              <p className="m-0 text-6xl text-left	">
                {delavalSubscriptionsCount}
              </p>
            </Panel>
          </div>
        </div>
      </div>
      </div>
      <div class="block font-bold text-center p-2 border-round mb-2">
      <Panel
        header="Unserviced devices with their respective components and sub-components"
        className="mt-2  shadow-2 border-round mypanel"
        style={{ width: "100%" }}
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
            onChange={(e) => {
              setServiceDate(e.value);
            }}
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
          tableStyle={{ minWidth: "50rem" }}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          cellSelection
          selectionMode="single"
          selection={selectedCell}
          onSelectionChange={(e) => setSelectedCell(e.value)}
          onCellSelect={onCellSelect}
          onCellUnselect={onCellUnselect}
          className="mypanel"
        >
          <Column field="device_serial_number" header="Device ID" />
          <Column field="component_serial_number" header="Component ID" />
          <Column
            field="subcomponent_serial_number"
            header="Sub component ID"
          />
        </DataTable>
      </Panel>
      {
        <div class="card flex justify-content-center">
          <Sidebar
            position="right"
            visible={visible}
            onHide={() => {
              console.log("Sidebar closed");
              onCellUnselect(); // Reset the selected cell state setVisible(false);
            }}
            showCloseIcon={false}
            header={customHeader}
            style={{
              width: "27%",
              height: "27%",
              top: "60px",
              marginTop: "25px",
              position: "absolute",
            }}
          >
            <Divider className="w-full mt-0 mb-3" />
            <p className="flex w-full">
              <span className="label font-semibold">Serial number:</span>
              {headerName === "Device details" ? (
                <span className="ml-auto">
                  {device != null ? device.serial_number : ""}
                </span>
              ) : (
                <span className="ml-auto">
                  {component != null ? component.serial_number : ""}
                </span>
              )}
            </p>
            <p className="flex w-full">
              <span className="label font-semibold">Label:</span>
              {headerName === "Device details" ? (
                <span className="ml-auto">
                  {device != null ? device.label : ""}
                </span>
              ) : (
                <span className="ml-auto">
                  {component != null ? component.label : ""}
                </span>
              )}
            </p>
            {headerName === "Device details" ? (
              <p className="flex w-full">
                <span className="label font-semibold">Hardware version:</span>
                <span className="ml-auto">
                  {device != null ? device.hardware_version : ""}
                </span>
              </p>
            ) : null}

            <p className="flex w-full">
              <span className="label font-semibold">Installed date:</span>
              {headerName === "Device details" ? (
                <span className="ml-auto">
                  {device != null ? device.installed_at : ""}
                </span>
              ) : (
                <span className="ml-auto">
                  {component != null ? component.installed_at : ""}
                </span>
              )}
            </p>
            <p className="flex w-full">
              <span className="label font-semibold">Serviced date:</span>
              {headerName === "Device details" ? (
                <span className="ml-auto">
                  {device != null ? device.serviced_at : ""}
                </span>
              ) : (
                <span className="ml-auto">
                  {component != null ? component.serviced_at : ""}
                </span>
              )}
            </p>
          </Sidebar>
        </div>
      }
      </div>


    </div>
  );
}
