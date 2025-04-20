import React, { useState } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';

export default function TemplateDemo() {
    const [visible, setVisible] = useState(false);

    const customHeader = (
        <div className="flex justify-content-between align-items-center w-full">
            <span className="font-bold text-lg">Amy Elsner</span>
            <Button icon="pi pi-times" className="p-button-rounded p-button-text" onClick={() => setVisible(false)} />
        </div>
    );

    return (
        <div className="card flex justify-content-center">
            <Sidebar 
                position="right" 
                visible={visible} 
                onHide={() => setVisible(false)} 
                showCloseIcon={false}
                header={customHeader}
                style={{ width: '60%' }}
            >
                <Divider className="w-full mt-3 mb-3" />
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
            </Sidebar>
            <Button icon="pi pi-plus" onClick={() => setVisible(true)} />
        </div>
    );
}
