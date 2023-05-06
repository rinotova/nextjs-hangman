import React from "react";
import Button from "./Button";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { type Room } from "~/types/types";

function RoomsList() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const { data: rooms, isLoading: roomsLoading } =
    api.rooms.getAllRooms.useQuery();

  const { mutate: joinRoom, isLoading: isJoiningRoom } =
    api.rooms.updateRoom.useMutation({
      onSuccess: ({ id }) => {
        void router.push(`/room/${id}`);
      },
      onError: () => {
        // Show toast error
      },
    });

  function joinRoomHandler(room: Room) {
    if (!isJoiningRoom && userId) {
      if (userId === room.player1_ID || userId === room.player2_ID) {
        void router.push(`/room/${room.id}`);
        return;
      }
      joinRoom({
        id: room.id,
        updateData: {
          player2_ID: session?.user?.id,
        },
      });
    }
  }

  if (!rooms || roomsLoading) {
    return <div />;
  }

  return (
    <div className="mx-auto mt-12 flex w-full max-w-md flex-col items-center justify-center">
      {rooms.map((room) => {
        return (
          <div
            key={room.id}
            className="mb-4 flex w-full items-center justify-between rounded-lg  border border-dashed border-slate-600 bg-gray-900 p-2"
          >
            <span className="mr-2 rounded bg-green-900 px-2.5 py-0.5 text-sm font-medium text-green-300">
              {room.username}
            </span>

            {room.canJoin && (
              <Button onClick={() => joinRoomHandler(room)}>Join</Button>
            )}
            {!room.canJoin && <Button disabled={true}>Full</Button>}
          </div>
        );
      })}
    </div>
  );
}

export default RoomsList;
