import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "experimental-edge",
};

const font = fetch(
  new URL("../../../public/butcherman.ttf", import.meta.url)
).then((res) => res.arrayBuffer());

async function ogGenerate() {
  const fontData = await font;

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 200,
          color: "#ddd",
          background: "black",
          width: "100%",
          height: "100%",
          fontFamily: '"Butcherman"',
          display: "flex",
          textAlign: "center",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        H
      </div>
    ),
    {
      width: 250,
      height: 250,
      fonts: [
        {
          name: "Butcherman",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}

export default ogGenerate;
