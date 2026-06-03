import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <MessageCircle className="size-5 text-primary" />
          Disparo WS
        </Link>
      </div>
    </header>
  );
}
