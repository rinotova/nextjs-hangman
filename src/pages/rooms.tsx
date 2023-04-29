import { type NextPage } from "next";
import { type GetSessionParams, getSession } from "next-auth/react";

const Rooms: NextPage = () => {
  return (
    <div>
      <h1>Rooms</h1>
    </div>
  );
};

export default Rooms;

export const getServerSideProps = async (
  context: GetSessionParams | undefined
) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};
