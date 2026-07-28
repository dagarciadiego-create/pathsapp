export function brandIconElement(size: number) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0d9488 0%, #0f766e 55%, #0b4f4a 100%)",
        borderRadius: size * 0.18,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: size * 0.56,
            fontWeight: 700,
            color: "white",
            fontFamily: "sans-serif",
            lineHeight: 1,
          }}
        >
          P
        </div>
        <div
          style={{
            width: size * 0.42,
            height: size * 0.07,
            background: "white",
            borderRadius: size * 0.035,
            marginTop: size * 0.06,
          }}
        />
      </div>
    </div>
  );
}
