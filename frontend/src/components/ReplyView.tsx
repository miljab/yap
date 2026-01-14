import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect } from "react";
import { useParams } from "react-router";

function ReplyView() {
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosPrivate.get(
          `/comment/${params.id}/replies`,
        );
        console.log(response);
      } catch (error) {
        console.error(error);
        // TODO error handling
      }
    };

    fetchData();
  }, [params, axiosPrivate]);

  return <div>test</div>;
}

export default ReplyView;
