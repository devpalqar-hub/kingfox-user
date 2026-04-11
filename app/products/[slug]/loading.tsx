export default function ProductLoading() {
  return (
    <section
      style={{
        display: "grid",
        gap: "1rem",
        margin: "0 auto",
        maxWidth: "1200px",
        padding: "4rem 1.5rem",
      }}
    >
      <div
        style={{
          background: "#f2f2f2",
          borderRadius: "24px",
          height: "460px",
          width: "100%",
        }}
      />
      <div
        style={{
          background: "#f2f2f2",
          borderRadius: "16px",
          height: "32px",
          width: "40%",
        }}
      />
      <div
        style={{
          background: "#f2f2f2",
          borderRadius: "16px",
          height: "18px",
          width: "70%",
        }}
      />
      <div
        style={{
          display: "grid",
          gap: "0.75rem",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        }}
      >
        <div
          style={{
            background: "#f2f2f2",
            borderRadius: "16px",
            height: "52px",
          }}
        />
        <div
          style={{
            background: "#f2f2f2",
            borderRadius: "16px",
            height: "52px",
          }}
        />
      </div>
    </section>
  );
}
