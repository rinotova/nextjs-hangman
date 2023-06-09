const HEAD = (
  <div
    key={"head"}
    style={{
      width: "50px",
      height: "50px",
      borderRadius: "100%",
      border: "10px solid white",
      position: "absolute",
      top: "50px",
      left: "97px",
    }}
  />
);

const BODY = (
  <div
    key={"body"}
    style={{
      width: "10px",
      height: "100px",
      background: "white",
      position: "absolute",
      top: "90px",
      left: "118px",
    }}
  />
);

const RIGHT_ARM = (
  <div
    key={"right_arm"}
    style={{
      width: "70px",
      height: "10px",
      background: "white",
      position: "absolute",
      top: "150px",
      left: "125px",
      rotate: "-30deg",
      transformOrigin: "left bottom",
    }}
  />
);

const LEFT_ARM = (
  <div
    key={"left_arm"}
    style={{
      width: "70px",
      height: "10px",
      background: "white",
      position: "absolute",
      top: "150px",
      left: "50px",
      rotate: "30deg",
      transformOrigin: "right bottom",
    }}
  />
);

const RIGHT_LEG = (
  <div
    key={"right_leg"}
    style={{
      width: "100px",
      height: "10px",
      background: "white",
      position: "absolute",
      top: "180px",
      left: "120px",
      rotate: "60deg",
      transformOrigin: "left bottom",
    }}
  />
);

const LEFT_LEG = (
  <div
    key={"left_leg"}
    style={{
      width: "100px",
      height: "10px",
      background: "white",
      position: "absolute",
      top: "180px",
      left: "27px",
      rotate: "-60deg",
      transformOrigin: "right bottom",
    }}
  />
);

const FLOOR = (
  <div
    key={"floor"}
    style={{ height: "10px", width: "250px", background: "white" }}
  />
);

const POLE = (
  <div
    key={"pole"}
    style={{
      height: "300px",
      width: "10px",
      background: "white",
      marginLeft: "20px",
    }}
  />
);

const ROOF = (
  <div
    key={"roof"}
    style={{
      height: "10px",
      width: "100px",
      background: "white",
      marginLeft: "20px",
    }}
  />
);

const HANG = (
  <div
    key={"hang"}
    style={{
      height: "50px",
      width: "10px",
      background: "white",
      position: "absolute",
      top: 0,
      left: "118px",
    }}
  />
);

const HANGMAN_DRAWING = [
  ROOF,
  POLE,
  FLOOR,
  HANG,
  HEAD,
  BODY,
  RIGHT_ARM,
  LEFT_ARM,
  RIGHT_LEG,
  LEFT_LEG,
];

type HangmanDrawingProps = {
  numberOfGuesses: number;
};

export function HangmanDrawing({ numberOfGuesses }: HangmanDrawingProps) {
  return (
    <div style={{ position: "relative" }}>
      {HANGMAN_DRAWING.slice(0, numberOfGuesses)}
    </div>
  );
}
