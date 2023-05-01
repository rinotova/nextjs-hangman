import { type NextPage } from "next";
import { type GetSessionParams, getSession } from "next-auth/react";
import BirdsContainer from "~/components/BirdsContainer";
import Headline from "~/components/Headline";

const Rooms: NextPage = () => {
  return (
    <div>
      <BirdsContainer />
      <Headline title="Rooms" />
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
