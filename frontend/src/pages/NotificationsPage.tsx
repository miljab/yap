import { axiosPrivate } from "@/api/axios";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { Notification } from "@/types/notification";
import NotificationItem from "@/components/Notification";
import { Spinner } from "@/components/ui/spinner";
import FetchError from "@/components/FetchError";

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

  if (initialLoad) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div>
        {error ? (
          <FetchError error={error} onRetry={retry} />
        ) : (
          <div className="p-4 text-center text-neutral-500">
            No notifications yet
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}

      <div ref={loaderRef} className="flex justify-center p-4">
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <FetchError error={error} onRetry={retry} />
        ) : null}
      </div>
    </div>
  );
}

export default NotificationsPage;
