import { useState, useRef } from "react";
import {
  Modal,
  Button,
  Group,
  Textarea,
  Stack,
  Text,
  Box,
  List,
  Badge,
  Alert,
  ActionIcon,
  Tooltip,
  Paper,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconUpload,
  IconAlertCircle,
  IconCheck,
  IconTrash,
  IconFile,
} from "@tabler/icons-react";
import { parseDependenciesWithEcosystem } from "@/utils/parseDependencies";

interface ImportDependenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (packages: string[]) => void;
}

interface ParsedPackage {
  name: string;
  ecosystem: "npm" | "pypi" | "unknown";
}

export function ImportDependenciesModal({
  isOpen,
  onClose,
  onImport,
}: ImportDependenciesModalProps) {
  const [content, setContent] = useState("");
  const [parsedPackages, setParsedPackages] = useState<ParsedPackage[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseContent = (fileContent: string, filename?: string) => {
    try {
      setError("");
      const result = parseDependenciesWithEcosystem(fileContent, filename);
      setParsedPackages(result.dependencies);
      setDetectedFormat(result.format);
      setContent(fileContent);

      if (result.dependencies.length === 0) {
        setError("No packages found in the content");
        return false;
      }
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(`Error parsing content: ${errorMsg}`);
      setParsedPackages([]);
      return false;
    }
  };

  const handlePaste = () => {
    if (!content.trim()) {
      setError("Please paste some content first");
      return;
    }
    parseContent(content);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      parseContent(fileContent, file.name);
    };

    reader.onerror = () => {
      setError("Failed to read file");
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileContent = event.target?.result as string;
      parseContent(fileContent, file.name);
    };

    reader.onerror = () => {
      setError("Failed to read file");
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedPackages.length === 0) {
      setError("No packages to import");
      return;
    }

    const packageNames = parsedPackages.map((pkg) => pkg.name);
    onImport(packageNames);

    notifications.show({
      title: "Success",
      message: `Imported ${String(parsedPackages.length)} package${parsedPackages.length !== 1 ? "s" : ""}`,
      color: "green",
      icon: <IconCheck size={16} />,
    });

    // Reset state
    setContent("");
    setParsedPackages([]);
    setDetectedFormat("");
    setError("");
    onClose();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setContent("");
    setParsedPackages([]);
    setDetectedFormat("");
    setError("");
  };

  const maxPreviewItems = 10;
  const hiddenCount = Math.max(0, parsedPackages.length - maxPreviewItems);

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="Import Dependencies"
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Input Section */}
        <Stack gap="sm">
          <div>
            <Group justify="space-between" mb="xs">
              <Text fw={500} size="sm">
                Paste or Upload
              </Text>
              <Group gap="xs">
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => fileInputRef.current?.click()}
                  leftSection={<IconFile size={14} />}
                >
                  Choose File
                </Button>
              </Group>
            </Group>

            {/* Drag and Drop Area */}
            <Paper
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              p="md"
              radius="md"
              style={{
                border: `2px dashed var(--mantine-color-${isDragActive ? "brand" : "gray"}-3)`,
                backgroundColor: isDragActive
                  ? "var(--mantine-color-brand-light)"
                  : "transparent",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
            >
              <Center
                style={{
                  pointerEvents: "none",
                  minHeight: 120,
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <IconUpload
                  size={32}
                  color={
                    isDragActive
                      ? "var(--mantine-color-brand-6)"
                      : "var(--mantine-color-gray-5)"
                  }
                />
                <div style={{ textAlign: "center" }}>
                  <Text size="sm" fw={500}>
                    Drag and drop a file here
                  </Text>
                  <Text size="xs" c="dimmed">
                    or use the "Choose File" button
                  </Text>
                </div>
              </Center>
            </Paper>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.txt,.lock,.toml,.mod,.gemfile,.gradle,.xml"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />

            {/* Textarea for pasting */}
            <Textarea
              placeholder="Or paste your package.json, requirements.txt, yarn.lock, go.mod, or other dependency file content here..."
              value={content}
              onChange={(e) => {
                setContent(e.currentTarget.value);
                setError("");
              }}
              minRows={6}
              maxRows={10}
              mt="sm"
            />

            <Button onClick={handlePaste} fullWidth mt="sm">
              Parse Content
            </Button>

            <Text size="xs" c="dimmed" mt="xs">
              Supported formats: package.json, requirements.txt,
              package-lock.json, yarn.lock, go.mod, Gemfile, Cargo.toml,
              pom.xml, build.gradle, and plain text
            </Text>
          </div>
        </Stack>

        {/* Error Display */}
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
            {error}
          </Alert>
        )}

        {/* Parsed Packages Display */}
        {parsedPackages.length > 0 && (
          <Box>
            <Group justify="space-between" mb="sm">
              <Group gap="xs">
                <Text fw={500}>
                  Found {String(parsedPackages.length)} package
                  {parsedPackages.length !== 1 ? "s" : ""}
                </Text>
                <Badge size="lg" variant="light">
                  {detectedFormat}
                </Badge>
              </Group>
              <Tooltip label="Clear parsed packages">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  onClick={handleClear}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>

            <Box
              p="sm"
              style={{
                border: "1px solid var(--mantine-color-gray-3)",
                borderRadius: "var(--mantine-radius-md)",
                maxHeight: 200,
                overflow: "auto",
              }}
            >
              <List size="sm">
                {parsedPackages.slice(0, maxPreviewItems).map((pkg) => (
                  <List.Item key={pkg.name}>
                    <Group gap={8}>
                      <span>{pkg.name}</span>
                      <Badge
                        size="xs"
                        variant="light"
                        color={
                          pkg.ecosystem === "pypi"
                            ? "yellow"
                            : pkg.ecosystem === "npm"
                              ? "blue"
                              : "gray"
                        }
                      >
                        {pkg.ecosystem}
                      </Badge>
                    </Group>
                  </List.Item>
                ))}
              </List>
              {hiddenCount > 0 && (
                <Text size="xs" c="dimmed" mt="xs">
                  ... and {String(hiddenCount)} more
                </Text>
              )}
            </Box>

            <Button
              onClick={handleImport}
              fullWidth
              mt="md"
              color="green"
              leftSection={<IconCheck size={16} />}
            >
              Import Packages
            </Button>
          </Box>
        )}
      </Stack>
    </Modal>
  );
}
