import React from "react";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import { InputText } from "primereact/inputtext";

export default function AppBar() {
  return (
    <div className="bg-blue-500 flex align-items-center justify-content-between px-4 py-2 surface-0 shadow-2 mb-4">
      
      {/* Left: Logo / App Name */}
      <div className="flex align-items-center gap-2">
        <i className="text-white pi pi-bars text-2xl"></i>
        <span className="text-white text-xl font-bold text-primary">MyApp</span>
      </div>

      {/* Right: Actions */}
      <div className="flex align-items-center gap-3">
        <Button icon="pi pi-bell" className="text-white p-button-text p-button-rounded" />
        <Button icon="pi pi-cog" className="text-white p-button-text p-button-rounded" />
        <Avatar label="P" shape="circle" size="medium" image="/profile.png"/>
      </div>
    </div>
  );
}
