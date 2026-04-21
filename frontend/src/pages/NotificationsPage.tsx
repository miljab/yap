import { axiosPrivate } from "@/api/axios";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { Notification } from "@/types/notification";

function NotificationsPage() {
  const fetchNotifications = async (currentCursor?: string) => {
    const url = currentCursor
      ? `/notifications?cursor=${currentCursor}`
      : "/notifications";

    const response = await axiosPrivate.get(url);

    return {
      items: response.data.notifications,
      nextCursor: response.data.nextCursor,
    };
  };

  const {
    items: notifications,
    isLoading,
    initialLoad,
    loaderRef,
    error,
    retry,
  } = useInfiniteScroll<Notification>(fetchNotifications);

  return <p>notifications</p>;
}

export default NotificationsPage;
