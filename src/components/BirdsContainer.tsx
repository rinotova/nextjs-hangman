import React from "react";
import BirdsFlying from "./BirdsFlying";

function BirdsContainer({ isSplashPage = false }: { isSplashPage?: boolean }) {
  return (
    <div
      className={`${
        !isSplashPage ? "absolute left-0 top-4" : ""
      } flex w-full items-center justify-center overflow-hidden`}
    >
      <BirdsFlying />
    </div>
  );
}

export default BirdsContainer;
