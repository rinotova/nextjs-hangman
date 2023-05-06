import { type GetSessionParams, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import Button from "~/components/Button";
import { api } from "~/utils/api";

const Room = () => {
  // const { data: session } = useSession();

  const router = useRouter();
  const { roomId } = router.query;
  const theRoomId = roomId as string;
  const { data: room, isLoading: roomIsLoading } =
    api.rooms.getRoomData.useQuery(
      {
        roomId: theRoomId,
      },
      { enabled: !!theRoomId }
    );

  if (!room && !roomIsLoading) {
    void router.push("/");
    return;
  }

  if (!room || roomIsLoading) {
    return <div />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-white">Room</h1>
      <div className="mt-4 flex gap-4">
        <Button>Win game</Button>
        <Button>Lose game</Button>
      </div>
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
