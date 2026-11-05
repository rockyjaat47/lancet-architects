import { Container } from "./ui";

export default function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <Container className="pt-[11rem] max-lg:pt-32">
      <div className="grid grid-cols-12 gap-x-6 max-md:grid-cols-1">
        <p className="md:col-span-4 text-micro uppercase max-md:mb-6">Legal information</p>
        <div className="md:col-span-7 md:col-start-5 max-md:col-span-1">
          <h1 className="text-3xl leading-[1.1] max-md:text-2xl">{title}</h1>
          {updated && <p className="mt-4 text-micro uppercase opacity-80">Last updated: {updated}</p>}
          <div className="prose-studio mt-12 text-sm">{children}</div>
        </div>
      </div>
    </Container>
  );
}
