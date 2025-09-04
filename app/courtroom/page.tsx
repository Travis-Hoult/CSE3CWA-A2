import CourtroomGame from "../../components/CourtroomGame";

export default function CourtroomPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <CourtroomGame />
    </main>
  );
}