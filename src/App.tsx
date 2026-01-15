import { Container, Group, Title } from "@mantine/core";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "./theme";
import { PackageComparisonLayout } from "./components/comparison/PackageComparisonLayout";
import { StickyInputBar } from "./components/comparison/StickyInputBar";
import { SettingsModal } from "./components/ui/SettingsModal";

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications />

      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        style={{
          position: "absolute",
          left: "-9999px",
          zIndex: 999,
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
        onFocus={(e) => {
          e.target.style.left = "0";
          e.target.style.top = "0";
          e.target.style.width = "auto";
          e.target.style.height = "auto";
        }}
        onBlur={(e) => {
          e.target.style.left = "-9999px";
          e.target.style.width = "1px";
          e.target.style.height = "1px";
        }}
      >
        Skip to main content
      </a>

      <StickyInputBar packages={[]} onClear={() => {}} />
      <Container id="main-content" size="xl" py="xl">
        <Group justify="space-between" mb="xl">
          <Title>PeekPackage</Title>
          <SettingsModal />
        </Group>

        <PackageComparisonLayout />
      </Container>
    </MantineProvider>
  );
}

export default App;
