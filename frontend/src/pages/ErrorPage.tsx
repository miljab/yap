import { useLocation } from "react-router";

function ErrorPage() {
  const location = useLocation();
  const error = location.state?.error || "Unknown error";

  return (
    <div>
      <h1>Error</h1>
      <p>{error}</p>
    </div>
  );
}

export default ErrorPage;
