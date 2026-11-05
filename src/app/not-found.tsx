import Link from "next/link";
import { Container, PillLink } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="flex min-h-[80svh] flex-col items-start justify-center pt-32">
      <p className="text-micro uppercase">Error 404</p>
      <h1 className="mt-6 text-3xl leading-[1.1]">This page doesn’t exist (anymore).</h1>
      <div className="mt-10 flex gap-4">
        <PillLink href="/projects">View projects</PillLink>
        <Link href="/" className="self-center text-micro uppercase underline underline-offset-4">
          Home
        </Link>
      </div>
    </Container>
  );
}
