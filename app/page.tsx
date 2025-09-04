import TabsBuilder from "../components/TabsBuilder";

// Home shows the tab builder demo
export default function Home() {
  const h1: React.CSSProperties = { fontSize: 22, margin: "16px 0" };
  return (
    <section>
      <h1 style={h1}>Home — Tabs Builder</h1>
      <TabsBuilder />
    </section>
  );
}

