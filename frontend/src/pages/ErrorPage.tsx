import { useLocation, Link } from "react-router";

function ErrorPage() {
  const location = useLocation();
  const error =
    location.state?.error ||
    "Unknown error. Please try again, or contact support if the problem persists.";

  return (
    <div className="m-auto mt-12 flex w-9/12 flex-col gap-8">
      <Link to="/" className="text-4xl tracking-wider">
        yap.
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p>{error}</p>
      </div>

      <div className="flex flex-col gap-4">
        <Link to="/" className="underline">
          Go to the home page
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;
