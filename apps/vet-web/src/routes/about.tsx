import { Button } from "@monorepo/components";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="flex flex-col gap-4">
      <div>Hello from About!</div>
      <Link to="/">
        <Button name="go-home" variant="destructive">
          Go to home
        </Button>
      </Link>
    </div>
  );
}
