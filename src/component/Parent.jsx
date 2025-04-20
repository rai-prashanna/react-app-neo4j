import React from "react";
import 'primeflex/primeflex.css';

function Parent() {
  return (
    <div className="flex flex-wrap md:justify-content-between justify-content-center">
      <div
        className="surface-500 font-bold border-round m-2 flex align-items-center justify-content-center"
        style={{ minWidth: "200px", minHeight: "100px" }}
      >
        surface-500
      </div>
      <div
        className="bg-blue-500 font-bold border-round m-2 flex align-items-center justify-content-center"
        style={{ minWidth: "200px", minHeight: "100px" }}
      >
        bg-primary
      </div>
      <div className="surface-500 font-bold border-round m-2 flex align-items-center justify-content-center">
  surface-500
</div>



    </div>
  );
}

export default Parent;
