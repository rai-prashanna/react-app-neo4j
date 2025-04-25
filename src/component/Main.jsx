import AppBar from "./AppBar";
import React from "react";
import UnServiceDevice from "./UnServiceDevice";
import HeadlessDemo from "./Example";
import { faHome,faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NotFoundPage } from "./NotFoundPage";
export default function Main() {
  return (
    <div>
      <AppBar />
      <UnServiceDevice />
      {/* <NotFoundPage/> */}
      </div>
  );
}
