import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useUnservicedDevices } from "../service/GraphQLService";

export default function UnServiceDevice() {
    const { loading, error, data } = useUnservicedDevices();
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error fetching data</p>;

    return (
        <div className="card">
            <DataTable value={data} showGridlines tableStyle={{ minWidth: '50rem' }}>
                <Column field="device_serial_number" header="DeviceId"></Column>
                <Column field="component_serial_number" header="ComponentId"></Column>
                <Column field="subcomponent_serial_number" header="SubComponentID"></Column>
            </DataTable>
        </div>
    );
}
        