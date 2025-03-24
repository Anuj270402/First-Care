import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          Your Trusted Online Pharmacy
        </h1>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          Get your medicines delivered to your doorstep with our secure and reliable service.
        </p>
        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
          <Link to="/catalog">
            <Button size="lg">Browse Medicines</Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" size="lg">View Profile</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}