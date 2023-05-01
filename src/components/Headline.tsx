import React from "react";

function Headline({ title }: { title: string }) {
  return <h1 className="font-butcher text-5xl text-slate-300">{title}</h1>;
}

export default Headline;
