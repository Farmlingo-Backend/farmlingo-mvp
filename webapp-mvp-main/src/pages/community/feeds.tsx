import useUserStore from "@/store/userStore";

const Feeds = () => {
  const user = useUserStore((state) => state.user);

  return <div>Welcome, {user?.name || "Guest"}!</div>;
};

export default Feeds;





