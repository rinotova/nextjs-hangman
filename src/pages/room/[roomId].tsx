import { type NextPage } from "next";
import { type GetSessionParams, getSession } from "next-auth/react";
import { useRouter } from "next/router";

const Room: NextPage = () => {
  const router = useRouter();
  const { roomId } = router.query;
  console.log(roomId);
  return (
    <div>
      <h1 className="text-white">Room A</h1>
    </div>
  );
};

export default Room;

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
