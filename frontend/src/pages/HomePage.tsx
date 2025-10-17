import useAuth from "@/hooks/useAuth";

function HomePage() {
  const { auth } = useAuth();
  console.log(auth);
  return (
    <div>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Saepe aut quas
      cumque explicabo, esse molestias commodi ab asperiores quod nihil
      provident, quidem cupiditate dolores eaque? Incidunt voluptas
      necessitatibus laborum deleniti.
    </div>
  );
}

export default HomePage;
