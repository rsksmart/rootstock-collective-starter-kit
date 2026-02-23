import { StarterProps } from "@/lib/types";
import StarterCard from "./StarterCard";

export default function Starters(): JSX.Element {
  return (
    <section className="mx-auto" id="starters">
      <header className="text-center">
        <p className="text-white/70">Starter kits</p>
        <h2 className="text-3xl font-bold">Available starters</h2>
      </header>
      <div className="container mx-auto my-12 grid grid-cols-1 gap-6 md:grid-cols-2 max-w-3xl">
        {starters.map((starter) => (
          <StarterCard key={starter.name} starter={starter} />
        ))}
      </div>
    </section>
  );
}

const starters: StarterProps[] = [
  {
    name: "Collective DAO: Stake & Vote",
    description:
      "Rootstock Collective DAO Starter Kit. Connect wallet, stake RIF, view active proposals, and vote on Rootstock Testnet using the Collective SDK.",
    link: "/",
  },
  {
    name: "Legacy: Contract Interaction with Wagmi",
    description:
      "Get started with contract interaction using the Wagmi library. Pre-configured Wagmi setup, sample contract interactions, and more.",
    link: "/legacy/wagmi",
  },
  {
    name: "Legacy: Account Abstraction with Etherspot",
    description:
      "Account Abstraction Starter Kit. Foundation for building applications with account abstraction.",
    link: "/legacy/aa",
  },
];
