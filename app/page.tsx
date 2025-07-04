import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
  
  // This part will not run
  return <h1>Redirecting...</h1>;
}
